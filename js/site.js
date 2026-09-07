/* ==========================================================================
   AgroSelect — site behaviour
   Progressive enhancement only: every page is readable and usable if this
   file never loads. Requires js/crops.js on pages that compare crops.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------- utils */

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var naira = new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0
  });
  var plain = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 });

  function money(n) {
    if (n === null || n === undefined || !isFinite(n)) return 'Unavailable';
    return naira.format(Math.round(n)).replace('NGN', '₦').replace(/\s/g, '');
  }
  function num(n, dp) {
    if (n === null || n === undefined || !isFinite(n)) return 'Unavailable';
    return dp ? n.toFixed(dp) : plain.format(Math.round(n));
  }
  function titleCase(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  window.AgroFormat = { money: money, num: num };

  /* --------------------------------------------------------- mobile nav */

  function initNav() {
    var toggle = $('.nav-toggle');
    var nav = $('#site-nav');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        close();
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });

    // Reset state when the layout returns to the desktop nav.
    var mq = window.matchMedia('(min-width: 901px)');
    var onChange = function (e) { if (e.matches) close(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ------------------------------------------------------------- storage */

  var KEY = 'agroselect.farm.v1';

  function saveFarm(data) {
    try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* private mode */ }
  }
  function loadFarm() {
    try {
      var raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  /* ---------------------------------------------------------- the engine */

  /**
   * Scale the published per-hectare figures to the farmer's plot and work out
   * what their budget can actually cover. Per-hectare figures are used as
   * published rather than recomputed, so the site always agrees with NAERLS.
   */
  function compare(farm) {
    var crops = window.AGRO_CROPS || [];
    var ha = farm.hectares;
    var budget = farm.budget;

    var rows = farm.crops.map(function (id) {
      var c = crops.filter(function (x) { return x.id === id; })[0];
      if (!c) return null;

      var cost = c.costPerHa * ha;
      var revenue = c.revenuePerHa === null ? null : c.revenuePerHa * ha;
      var ret = c.returnPerHa === null ? null : c.returnPerHa * ha;
      var affordable = cost <= budget;

      return {
        crop: c,
        cost: cost,
        revenue: revenue,
        ret: ret,
        yieldKg: c.yieldMtHa * 1000 * ha,
        affordable: affordable,
        shortfall: affordable ? 0 : cost - budget,
        // How much land this budget covers, if it cannot cover the whole plot.
        affordableHa: c.costPerHa > 0 ? budget / c.costPerHa : 0,
        // Return per naira spent — lets a small budget be compared fairly.
        returnPerNaira: (ret === null || cost <= 0) ? null : ret / cost,
        priced: c.returnPerHa !== null
      };
    }).filter(Boolean);

    // Rank: priced crops first, by total return; unpriced crops last.
    rows.sort(function (a, b) {
      if (a.priced !== b.priced) return a.priced ? -1 : 1;
      if (!a.priced) return a.cost - b.cost;
      return b.ret - a.ret;
    });

    rows.forEach(function (r, i) { r.rank = i + 1; });

    var affordablePriced = rows.filter(function (r) { return r.priced && r.affordable; });
    var best = affordablePriced[0] || null;

    return {
      rows: rows,
      best: best,
      anyAffordable: affordablePriced.length > 0,
      anyPriced: rows.some(function (r) { return r.priced; }),
      unpriced: rows.filter(function (r) { return !r.priced; })
    };
  }

  window.AgroCompare = compare;

  /* ------------------------------------------------------- get-started */

  function initFarmForm() {
    var form = $('#farm-form');
    if (!form) return;

    var summary = $('#error-summary');
    var summaryList = $('#error-summary-list');

    function fieldWrap(el) { return el.closest('.field') || el.closest('.fieldset'); }

    function setError(el, on) {
      var w = fieldWrap(el);
      if (w) w.classList.toggle('has-error', !!on);
    }

    function checkedCrops() {
      return $$('input[name="crops"]:checked', form).map(function (i) { return i.value; });
    }

    function validate() {
      var errors = [];

      var location = $('#location', form);
      var size = $('#farm-size', form);
      var budget = $('#budget', form);
      var cropsFs = $('#crops-fieldset', form);
      var expFs = $('#experience-fieldset', form);

      if (!location.value) {
        errors.push({ id: 'location', msg: 'Choose the state your farm is in.' });
        setError(location, true);
      } else setError(location, false);

      var sizeVal = parseFloat(size.value);
      if (!size.value || !isFinite(sizeVal) || sizeVal <= 0) {
        errors.push({ id: 'farm-size', msg: 'Enter your farm size in hectares — it must be more than zero.' });
        setError(size, true);
      } else setError(size, false);

      var budgetVal = parseFloat(budget.value);
      if (!budget.value || !isFinite(budgetVal) || budgetVal <= 0) {
        errors.push({ id: 'budget', msg: 'Enter the budget you have available for this season.' });
        setError(budget, true);
      } else setError(budget, false);

      var crops = checkedCrops();
      if (crops.length === 0) {
        errors.push({ id: 'maize', msg: 'Select at least one crop to compare.' });
        cropsFs.classList.add('has-error');
      } else cropsFs.classList.remove('has-error');

      var exp = $('input[name="experience"]:checked', form);
      if (!exp) {
        errors.push({ id: 'exp-first', msg: 'Tell us how much farming experience you have.' });
        expFs.classList.add('has-error');
      } else expFs.classList.remove('has-error');

      return errors;
    }

    function showSummary(errors) {
      if (!summary || !summaryList) return;
      if (!errors.length) {
        summary.classList.remove('is-visible');
        summaryList.innerHTML = '';
        return;
      }
      summaryList.innerHTML = errors.map(function (e) {
        return '<li><a href="#' + e.id + '">' + e.msg + '</a></li>';
      }).join('');
      summary.classList.add('is-visible');
      summary.setAttribute('tabindex', '-1');
      summary.focus();
      summary.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    // Live count of selected crops.
    var countEl = $('#crop-count');
    function updateCount() {
      if (!countEl) return;
      var n = checkedCrops().length;
      countEl.textContent = n === 0 ? 'None selected yet'
        : n + (n === 1 ? ' crop selected' : ' crops selected');
    }
    $$('input[name="crops"]', form).forEach(function (i) {
      i.addEventListener('change', function () {
        updateCount();
        if (checkedCrops().length) $('#crops-fieldset', form).classList.remove('has-error');
      });
    });

    // Clear an error as soon as the farmer fixes it.
    $$('.input, .input-unit input', form).forEach(function (el) {
      el.addEventListener('input', function () { setError(el, false); });
      el.addEventListener('change', function () { setError(el, false); });
    });
    $$('input[name="experience"]', form).forEach(function (i) {
      i.addEventListener('change', function () { $('#experience-fieldset', form).classList.remove('has-error'); });
    });

    // Restore a previous answer set so Back from the results page is lossless.
    var saved = loadFarm();
    if (saved) {
      if (saved.state) $('#location', form).value = saved.state;
      if (saved.hectares) $('#farm-size', form).value = saved.hectares;
      if (saved.budget) $('#budget', form).value = saved.budget;
      if (saved.soil) $('#soil', form).value = saved.soil;
      (saved.crops || []).forEach(function (id) {
        var box = $('input[name="crops"][value="' + id + '"]', form);
        if (box) box.checked = true;
      });
      if (saved.experience) {
        var r = $('input[name="experience"][value="' + saved.experience + '"]', form);
        if (r) r.checked = true;
      }
    }
    updateCount();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errors = validate();
      if (errors.length) {
        showSummary(errors);
        var first = document.getElementById(errors[0].id);
        if (first) first.focus({ preventScroll: true });
        return;
      }
      showSummary([]);

      saveFarm({
        state: $('#location', form).value,
        stateLabel: $('#location', form).selectedOptions[0].textContent.trim(),
        hectares: parseFloat($('#farm-size', form).value),
        budget: parseFloat($('#budget', form).value),
        crops: checkedCrops(),
        experience: ($('input[name="experience"]:checked', form) || {}).value || '',
        soil: $('#soil', form).value.trim(),
        savedAt: Date.now()
      });

      window.location.href = 'results.html';
    });
  }

  /* ----------------------------------------------------------- results */

  var EXPERIENCE_LABEL = {
    'first-season': 'First season',
    'few-seasons': 'A few seasons',
    'experienced': 'Experienced'
  };

  function initResults() {
    var root = $('#results-root');
    if (!root) return;

    var farm = loadFarm();
    var empty = $('#results-empty');

    if (!farm || !farm.crops || !farm.crops.length) {
      if (empty) empty.hidden = false;
      root.hidden = true;
      return;
    }

    if (empty) empty.hidden = true;
    root.hidden = false;

    var result = compare(farm);

    /* -- context strip -------------------------------------------------- */
    var ctx = $('#result-context');
    if (ctx) {
      ctx.innerHTML = [
        ['Location', farm.stateLabel || titleCase(farm.state)],
        ['Farm size', num(farm.hectares, farm.hectares % 1 ? 2 : 0) + ' ha'],
        ['Budget', money(farm.budget)],
        ['Experience', EXPERIENCE_LABEL[farm.experience] || '—'],
        ['Crops compared', String(result.rows.length)]
      ].map(function (p) {
        return '<div><dt>' + p[0] + '</dt><dd>' + p[1] + '</dd></div>';
      }).join('');
    }

    /* -- headline recommendation ---------------------------------------- */
    var winner = $('#result-winner');
    if (winner) {
      if (result.best) {
        var b = result.best;
        var why = [];
        why.push('On ' + num(farm.hectares, farm.hectares % 1 ? 2 : 0) + ' ha, ' +
          b.crop.name.toLowerCase() + ' shows the largest indicative return of the crops you picked ' +
          'that your budget of ' + money(farm.budget) + ' can cover.');
        if (result.rows.length > 1) {
          var runnerUp = result.rows.filter(function (r) {
            return r.priced && r.affordable && r !== b;
          })[0];
          if (runnerUp) {
            why.push('That is ' + money(b.ret - runnerUp.ret) + ' more than ' +
              runnerUp.crop.name.toLowerCase() + ', the next option you can afford.');
          }
        }
        winner.innerHTML =
          '<span class="badge badge-solid">Best indicative return</span>' +
          '<h2>' + b.crop.name + '</h2>' +
          '<p class="winner-why">' + why.join(' ') + '</p>' +
          '<div class="winner-figs">' +
            fig('Indicative return', money(b.ret)) +
            fig('Production cost', money(b.cost), true) +
            fig('Expected harvest', num(b.yieldKg) + ' kg', true) +
            fig('Budget left over', money(farm.budget - b.cost), true) +
          '</div>';
      } else if (result.anyPriced) {
        var cheapest = result.rows.filter(function (r) { return r.priced; })
          .sort(function (a, b2) { return a.cost - b2.cost; })[0];
        winner.innerHTML =
          '<span class="badge badge-amber">Budget is short</span>' +
          '<h2>None of these crops fit your budget at this size</h2>' +
          '<p class="winner-why">Your budget of ' + money(farm.budget) + ' does not cover ' +
          num(farm.hectares, farm.hectares % 1 ? 2 : 0) + ' ha of any crop you selected. ' +
          'The closest is ' + cheapest.crop.name.toLowerCase() + ' at ' + money(cheapest.cost) +
          '. On this budget you could plant about ' + num(cheapest.affordableHa, 2) +
          ' ha of it — or raise the budget and compare again.</p>' +
          '<div class="winner-figs">' +
            fig('Lowest cost option', cheapest.crop.name, true) +
            fig('Cost at your size', money(cheapest.cost), true) +
            fig('Short by', money(cheapest.shortfall), true) +
            fig('Area you can cover', num(cheapest.affordableHa, 2) + ' ha') +
          '</div>';
      } else {
        winner.innerHTML =
          '<span class="badge badge-amber">No priced crop selected</span>' +
          '<h2>We cannot rank the crops you selected</h2>' +
          '<p class="winner-why">Every crop you picked is missing a comparable North-West ' +
          'July 2024 market price, so no return can be worked out. Costs and expected ' +
          'yields are still shown below. Add a priced crop — maize, rice, sorghum, millet, ' +
          'cowpea or groundnut — to see a comparison.</p>';
      }
    }

    function fig(label, value, neutral) {
      return '<div' + (neutral ? ' class="is-neutral"' : '') + '><span>' + label +
        '</span><strong>' + value + '</strong></div>';
    }

    /* -- comparison table ------------------------------------------------ */
    var tbody = $('#result-table-body');
    if (tbody) {
      tbody.innerHTML = result.rows.map(function (r) {
        var isBest = result.best === r;
        var status;
        if (!r.priced) {
          status = '<span class="badge badge-neutral">No price</span>';
        } else if (r.affordable) {
          status = '<span class="badge badge-green">Within budget</span>';
        } else {
          status = '<span class="badge badge-amber">Over by ' + money(r.shortfall) + '</span>';
        }

        return '<tr' + (isBest ? ' class="is-best"' : '') + '>' +
          '<td><div class="result-row-name"><span class="rank-chip">' + r.rank + '</span>' +
            '<a href="crops.html#' + r.crop.id + '">' + r.crop.name + '</a></div></td>' +
          '<td>' + num(r.yieldKg) + ' kg</td>' +
          '<td>' + money(r.cost) + '</td>' +
          '<td' + (r.revenue === null ? ' class="cell-muted"' : '') + '>' + money(r.revenue) + '</td>' +
          '<td' + (r.ret === null ? ' class="cell-muted"' : '') + '><strong>' + money(r.ret) + '</strong></td>' +
          '<td>' + (r.returnPerNaira === null ? '<span class="cell-muted">—</span>'
                    : '₦' + r.returnPerNaira.toFixed(2)) + '</td>' +
          '<td>' + status + '</td>' +
        '</tr>';
      }).join('');
    }

    /* -- per-crop notes -------------------------------------------------- */
    var notes = $('#result-notes');
    if (notes) {
      notes.innerHTML = result.rows.map(function (r) {
        var lines = [];
        lines.push('<p>' + r.crop.blurb + '</p>');
        if (!r.affordable && r.priced) {
          lines.push('<p><strong>Budget:</strong> covers about ' + num(r.affordableHa, 2) +
            ' ha of the ' + num(farm.hectares, farm.hectares % 1 ? 2 : 0) + ' ha you entered.</p>');
        }
        lines.push('<p><strong>Planting:</strong> ' + r.crop.planting + ' · <strong>Harvest:</strong> ' +
          r.crop.harvest.replace(/^About /, 'about ') + '</p>');
        lines.push('<p><strong>Main risks:</strong> ' + r.crop.risks + '</p>');
        if (farm.experience === 'first-season' && r.crop.startupLoad === 'high') {
          lines.push('<p><strong>Worth knowing:</strong> this crop carries the heaviest input bill ' +
            'on the list. In a first season, a cheaper crop leaves more room for a mistake.</p>');
        }
        return '<article class="detail-block">' +
          '<h3>' + r.crop.name + '</h3>' + lines.join('') + '</article>';
      }).join('');
    }

    /* -- soil note ------------------------------------------------------- */
    var soilBox = $('#result-soil');
    if (soilBox) {
      if (farm.soil) {
        soilBox.hidden = false;
        var target = $('#result-soil-text', soilBox);
        if (target) target.textContent = farm.soil;
      } else {
        soilBox.hidden = true;
      }
    }

    /* -- print / start over ---------------------------------------------- */
    var printBtn = $('#print-results');
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
  }

  /* ------------------------------------------------- home page preview */

  function initHomePreview() {
    var host = $('#hero-preview-rows');
    if (!host || !window.AGRO_CROPS) return;

    // A worked example on 2 ha — the same maths the results page runs.
    var ha = 2;
    var picks = ['rice', 'groundnut', 'maize', 'millet'];
    var rows = picks.map(function (id) {
      var c = window.AGRO_CROPS.filter(function (x) { return x.id === id; })[0];
      return { name: c.name, value: c.returnPerHa * ha };
    }).sort(function (a, b) { return b.value - a.value; });

    var max = rows[0].value;
    host.innerHTML = rows.map(function (r, i) {
      return '<div class="preview-row' + (i === 0 ? ' is-best' : '') + '">' +
        '<div class="preview-crop"><span class="preview-rank">' + (i + 1) + '</span>' +
        '<span class="preview-name">' + r.name + '</span></div>' +
        '<span class="preview-value">' + money(r.value) + '</span>' +
        '<span class="preview-bar"><i style="width:' + Math.round(r.value / max * 100) + '%"></i></span>' +
      '</div>';
    }).join('');
  }

  /* ------------------------------------------------------ crop tables */

  function initCropCards() {
    var host = $('#crop-card-grid');
    if (!host || !window.AGRO_CROPS) return;

    host.innerHTML = window.AGRO_CROPS.map(function (c) {
      // Short name on the card so no title wraps and knocks its figures out of
      // line with the rest of the grid; the full name is on the crop page.
      return '<a class="crop-card" href="crops.html#' + c.id + '">' +
        '<div class="crop-card-head"><h3>' + (c.shortName || c.name) + '</h3>' +
          (c.returnPerHa === null
            ? '<span class="badge badge-neutral">No price</span>'
            : '<span class="badge badge-green">Priced</span>') +
        '</div>' +
        '<div class="crop-card-figs">' +
          '<div class="crop-card-fig"><span>Yield</span><strong>' + c.yieldMtHa.toFixed(2) + ' MT/ha</strong></div>' +
          '<div class="crop-card-fig"><span>Cost</span><strong>' + money(c.costPerHa) + '</strong></div>' +
          '<div class="crop-card-fig"><span>Price</span><strong>' +
            (c.pricePerKg === null ? '—' : money(c.pricePerKg) + '/kg') + '</strong></div>' +
          '<div class="crop-card-fig"><span>Return/ha</span><strong>' + money(c.returnPerHa) + '</strong></div>' +
        '</div>' +
        '<span class="crop-card-link">See the full figures &rarr;</span>' +
      '</a>';
    }).join('');
  }

  function initCropTable() {
    var tbody = $('#crop-table-body');
    if (!tbody || !window.AGRO_CROPS) return;

    var best = window.AGRO_CROPS.reduce(function (a, c) {
      if (c.returnPerHa === null) return a;
      return (!a || c.returnPerHa > a.returnPerHa) ? c : a;
    }, null);

    tbody.innerHTML = window.AGRO_CROPS.map(function (c) {
      return '<tr' + (c === best ? ' class="is-best"' : '') + '>' +
        '<td><a href="#' + c.id + '">' + c.name + '</a></td>' +
        '<td' + (c.pricePerKg === null ? ' class="cell-muted"' : '') + '>' +
          (c.pricePerKg === null ? 'Unavailable' : money(c.pricePerKg)) + '</td>' +
        '<td>' + c.yieldMtHa.toFixed(2) + '</td>' +
        '<td>' + money(c.costPerHa) + '</td>' +
        '<td' + (c.revenuePerHa === null ? ' class="cell-muted"' : '') + '>' + money(c.revenuePerHa) + '</td>' +
        '<td' + (c.returnPerHa === null ? ' class="cell-muted"' : '') + '><strong>' +
          money(c.returnPerHa) + '</strong></td>' +
      '</tr>';
    }).join('');
  }

  /* --------------------------------------------------------- contact */

  function initContactForm() {
    var form = $('#contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = form.checkValidity();
      var status = $('#contact-status');
      if (!ok) { form.reportValidity(); return; }

      // No back end yet: hand the message to the visitor's mail client so the
      // form never silently swallows what they wrote.
      var name = $('#contact-name', form).value.trim();
      var email = $('#contact-email', form).value.trim();
      var subject = $('#contact-subject', form).value;
      var message = $('#contact-message', form).value.trim();

      var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
      var href = 'mailto:agroselect25@gmail.com' +
        '?subject=' + encodeURIComponent('[AgroSelect] ' + subject) +
        '&body=' + encodeURIComponent(body);

      if (status) {
        status.hidden = false;
        status.textContent = 'Opening your email app with the message ready to send. ' +
          'If nothing happens, email agroselect25@gmail.com directly.';
      }
      window.location.href = href;
    });
  }

  /* ------------------------------------------------------------- year */

  function initYear() {
    $$('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* -------------------------------------------------------------- boot */

  function boot() {
    initNav();
    initYear();
    initHomePreview();
    initCropCards();
    initCropTable();
    initFarmForm();
    initResults();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
