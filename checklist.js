const CyberChecklist = {
    currentPage: 0,
    pages: ['page1', 'page2', 'page3', 'page4', 'page5'],

    init() {
        this.showPage(this.currentPage);
        this.setupAccordions();

        // Observe content changes in .accordion-content
        const observer = new ResizeObserver(() => this.adjustAccordionHeights());
        document.querySelectorAll('.accordion-content').forEach(content => observer.observe(content));

        // Adjust height when <details> elements are toggled
        document.querySelectorAll('details').forEach(detail => {
            detail.addEventListener('toggle', () => {
                const accordionContent = detail.closest('.accordion-content');
                if (accordionContent && accordionContent.classList.contains('active')) {
                    this.adjustAccordionHeight(accordionContent);
                }
            });
        });
    },

    adjustAccordionHeight(content) {
        content.style.maxHeight = 'none';
        const fullHeight = content.scrollHeight;
        content.style.maxHeight = `${fullHeight}px`;
    },

    showPage(pageIndex) {
        this.clearErrorStates();

        this.pages.forEach(pageId => {
            const page = document.getElementById(pageId);
            if (page) page.classList.remove('active');
        });

        const page = document.getElementById(this.pages[pageIndex]);
        if (page) {
            page.classList.add('active');
            const header = page.querySelector('h2');
            if (header) {
                header.setAttribute('tabindex', '-1');
                header.focus();
            }

            this.updateProgress(pageIndex);
            this.updateNavigationButtons();
            this.setupAccordions(); // rebind for new page
        }
    },

    updateProgress(index) {
        document.getElementById('pageIndicator').textContent = `Page ${index + 1} of ${this.pages.length}`;
        document.getElementById('progressFill').style.width = `${((index + 1) / this.pages.length) * 100}%`;
    },

    updateNavigationButtons() {
        const currentPageElement = document.querySelector('.page.active');
        const nextBtn = currentPageElement.querySelector('.nextBtn');
        const backBtn = currentPageElement.querySelector('.backBtn');

        if (backBtn) {
            backBtn.style.visibility = this.currentPage === 0 ? 'hidden' : 'visible';
            backBtn.onclick = () => this.prevPage();
        }

        if (nextBtn) {
            if (this.currentPage === this.pages.length - 1) {
                nextBtn.textContent = 'Complete Assessment';
                nextBtn.onclick = () => this.showResults();
            } else {
                nextBtn.textContent = 'Next';
                nextBtn.onclick = () => this.nextPage();
            }
        }
    },

    clearErrorStates() {
        document.querySelectorAll('.accordion-item.error').forEach(item => {
            item.classList.remove('error');
        });
    },

    highlightUnansweredQuestions(unanswered) {
        const currentPageElement = document.getElementById(this.pages[this.currentPage]);
        
        unanswered.forEach(questionName => {
            const fieldset = currentPageElement.querySelector(`input[name="${questionName}"]`)?.closest('.accordion-item');
            if (fieldset) {
                fieldset.classList.add('error');
                
                // Remove error styling after 3 seconds
                setTimeout(() => {
                    fieldset.classList.remove('error');
                }, 3000);
            }
        });
    },

    validateCurrentPage() {
        const currentPageId = this.pages[this.currentPage];
        const currentPageElement = document.getElementById(currentPageId);

        const questions = new Set();
        const answered = new Set();

        currentPageElement.querySelectorAll('input[type="radio"]').forEach(input => {
            questions.add(input.name);
            if (input.checked) {
                answered.add(input.name);
            }
        });

        const unanswered = [...questions].filter(q => !answered.has(q));

        if (unanswered.length > 0) {
            this.showValidationError(unanswered);
            return false;
        }

        return true;
    },

    showValidationError(unanswered) {
        const message = unanswered.length === 1 
            ? "Please answer the highlighted question before continuing."
            : "Please answer all highlighted questions before continuing.";
            
        alert(message);
        this.highlightUnansweredQuestions(unanswered);
    },

    nextPage() {
        if (!this.validateCurrentPage()) {
            return;
        }

        if (this.currentPage < this.pages.length - 1) {
            this.currentPage++;
            this.showPage(this.currentPage);
        }
    },

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.showPage(this.currentPage);
        }
    },

    setupAccordions() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.setAttribute('tabindex', '0');
            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'false');

            header.onclick = null;
            header.onkeydown = null;

            header.onclick = () => this.toggleAccordion(header);
            header.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleAccordion(header);
                }
            };
        });
    },

    toggleAccordion(header) {
        const content = header.nextElementSibling;
        const isExpanded = header.classList.contains('active');
        const icon = header.querySelector('.accordion-icon');

        header.setAttribute('aria-expanded', (!isExpanded).toString());
        content.setAttribute('aria-hidden', isExpanded ? 'true' : 'false');

        // Close others on current page
        const page = document.querySelector('.page.active');
        page.querySelectorAll('.accordion-header').forEach(h => {
            if (h !== header) {
                h.classList.remove('active');
                h.setAttribute('aria-expanded', 'false');
                const i = h.querySelector('.accordion-icon');
                if (i) i.textContent = '▼';
            }
        });

        page.querySelectorAll('.accordion-content').forEach(c => {
            if (c !== content) {
                c.classList.remove('active');
                c.setAttribute('aria-hidden', 'true');
                c.style.maxHeight = null;
            }
        });


        if (isExpanded) {
            content.classList.remove('active');
            content.style.maxHeight = null;
            header.classList.remove('active');
            if (icon) icon.textContent = '▼';
        } else {
            content.classList.add('active');
            this.adjustAccordionHeight(content);
            header.classList.add('active');
            if (icon) icon.textContent = '▲';
        }
    },

    adjustAccordionHeights() {
    document.querySelectorAll('.accordion-content.active').forEach(content => {
        // Temporarily remove maxHeight to allow natural expansion
        content.style.maxHeight = 'none';

        // Force reflow and then set new height
        const fullHeight = content.scrollHeight;
        content.style.maxHeight = fullHeight + 'px';
    });
},
	// Return the category for a given question name (q1, q2, ...)
	questionCategory(name) {
	  const n = parseInt(String(name).replace(/[^\d]/g, ''), 10);
	  if (!Number.isFinite(n)) return 'General';

	  if (n >= 1 && n <= 4)   return 'Smart Home';
	  if (n >= 5 && n <= 8)   return 'Password Hygiene';
	  if (n >= 9 && n <= 12) return 'Home Network';
	  if (n >= 13 && n <= 15) return 'Privacy & Data Awareness';
	  if (n >= 16 && n <= 19) return 'Social Engineering & Phishing';
	  return 'General';
},
	// Pull the visible question title text for a question group
	questionTitle(name) {
	  const item = document.querySelector(`input[name="${name}"]`)?.closest('.accordion-item');
	  return item?.querySelector('.accordion-title')?.textContent?.trim() || name;
	},

	// Priority model: you can set data-priority on an input
	// e.g. <input ... data-priority="4"> for high-severity items.
	// Fallback to category weighting if not present.
	questionPriority(name, selectedInputValue) {
	  // Try specific priority from any input in the same group
	  let pri = 0;
	  document.querySelectorAll(`input[name="${name}"]`).forEach(inp => {
		const p = parseFloat(inp.dataset.priority);
		if (Number.isFinite(p) && p > pri) pri = p;
	  });

	  if (!pri) {
		const cat = this.questionCategory(name);
		const catWeights = {
		  'Password Hygiene': 4,
		  'Home Network': 4,
		  'Privacy & Data Awareness': 3,
		  'Smart Home': 3,
		  'Social Engineering & Phishing': 4,
		  'General': 2
		};
		pri = catWeights[cat] || 2;
	  }

	  // Slightly reduce weight for "unknown" vs "no"
	  if (selectedInputValue === 'unknown') pri = pri * 0.9;

	  return pri;
	},

// Build a Blob download
downloadFile(filename, mimeType, content) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
},

		calculateScore() {
	  const form = document.getElementById('checklist');
	  const formData = new FormData(form);

	  const overall = { safeCount: 0, total: 0 };
	  const categories = {}; // { "Smart Home": {safe:0,total:0}, ... }
	  const answers = [];    // full list of answers for export/top-fixes

	  for (let [name, value] of formData.entries()) {
		if (!/^q\d+$/i.test(name)) continue;
		if (!['yes', 'no', 'unknown'].includes(value)) continue;

		const cat = this.questionCategory(name);
		if (!categories[cat]) categories[cat] = { safe: 0, total: 0 };

		overall.total += 1;
		categories[cat].total += 1;

		if (value === 'yes') {
		  overall.safeCount += 1;
		  categories[cat].safe += 1;
		}

		answers.push({
		  name,
		  category: cat,
		  title: this.questionTitle(name),
		  value
		});
	  }

  return { overall, categories, answers };
},


		showResults() {
	  if (!this.validateCurrentPage()) return;

	  const { overall, categories, answers } = this.calculateScore();
	  const safePct = overall.total > 0 ? (overall.safeCount / overall.total) * 100 : 0;

	  // Hide all pages & per-page button rows (if any)
	  this.pages.forEach(id => document.getElementById(id).style.display = 'none');
	  document.querySelectorAll('.button-row').forEach(row => row.style.display = 'none');

	  // Risk banding (unchanged)
	  let riskClass, riskLevel, riskMessage;
	  if (safePct >= 80) {
		riskClass = 'low';
		riskLevel = 'Low Risk';
		riskMessage = 'Brilliant! You’ve put strong protections in place. Just keep up these habits and review things every now and then.';
	  } else if (safePct >= 60) {
		riskClass = 'low-medium';
		riskLevel = 'Low-Medium Risk';
		riskMessage = 'Good job — most of your setup is secure, but there are a few things you could tweak to be even safer.';
	  } else if (safePct >= 40) {
		riskClass = 'medium';
		riskLevel = 'Medium Risk';
		riskMessage = 'You’ve got some protections in place, but there are clear gaps. Fixing these will really strengthen your security.';
	  } else if (safePct >= 20) {
		riskClass = 'medium-high';
		riskLevel = 'Medium-High Risk';
		riskMessage = 'Your household is exposed in several areas. Tackling the recommended fixes will make a big difference.';
	  } else {
		riskClass = 'high';
		riskLevel = 'High Risk';
		riskMessage = 'Your setup is very vulnerable right now. It’s important to act quickly on the top fixes to protect your devices and accounts.';
	  }

	  // Collect recommendations (for NO and UNKNOWN), grouping by category and de-duping
	  const recsByCategory = {};
	  const seenRecs = new Set();

	  // Also build a list of "unsafe" findings for Top 5 prioritisation
	  const unsafeFindings = [];

	  answers.forEach(a => {
		if (!['no', 'unknown'].includes(a.value)) return;

		// Get selected input
		const selected = document.querySelector(`input[name="${a.name}"]:checked`);
		let recHtml = selected?.dataset?.recommendation || '';

		// If the chosen input has no recommendation, try the "no" input for that group
		if (!recHtml) {
		  const fallbackNo = document.querySelector(`input[name="${a.name}"][value="no"][data-recommendation]`);
		  if (fallbackNo) recHtml = fallbackNo.dataset.recommendation;
		}

		// Generic fallback if still none
		if (!recHtml) {
		  recHtml = `Review: ${a.title}`;
		}

		// Group for recommendation display
		if (!recsByCategory[a.category]) recsByCategory[a.category] = new Set();
		if (!seenRecs.has(recHtml)) {
		  recsByCategory[a.category].add(recHtml);
		  seenRecs.add(recHtml);
		}

		// Compute priority for the Top 5
		const pri = this.questionPriority(a.name, a.value);
		unsafeFindings.push({
		  name: a.name,
		  title: a.title,
		  category: a.category,
		  value: a.value,
		  priority: pri,
		  recommendation: recHtml
		});
	  });

	  // Sort unsafe by priority desc, then by category name (stable fallback)
	  unsafeFindings.sort((a, b) => b.priority - a.priority || a.category.localeCompare(b.category));

	  // Build the Top 5 fixes list 
	  const topFive = [];
	  const seenTitles = new Set();
	  for (const f of unsafeFindings) {
		if (seenTitles.has(f.title)) continue;
		topFive.push(f);
		seenTitles.add(f.title);
		if (topFive.length === 5) break;
	  }

	  const topFiveHtml = topFive.length
	  ? `<h4>Your Most Urgent Fixes</h4>
		 <p>Start with these actions — the higher the priority, the more urgent the fix.</p>
		 <ol class="top-five-list">
		   ${topFive.map(f => {
			   const urgentClass = f.priority === 5 ? ' class="urgent-fix"' : '';
			 const icon = f.priority === 5 ? '⚠️ ' : '';
			 return `<li${urgentClass}>${icon}<strong>${f.title}</strong> – ${f.recommendation}</li>`;
		   }).join('')}
		 </ol>`
	: '';

	  // Category breakdown table
	  const catRows = Object.entries(categories).map(([cat, s]) => {
		const pct = s.total ? Math.round((s.safe / s.total) * 100) : 0;
		return `<tr><td>${cat}</td><td>${s.safe} / ${s.total}</td><td>${pct}%</td></tr>`;
	  }).join('');

	  const categoryTable = `
		  <details class="cat-breakdown" role="group" aria-labelledby="cat-breakdown-summary">
	  <summary id="cat-breakdown-summary">Category breakdown</summary>
	  <p class="cat-explainer">
		Each category shows how many of your answers were safe practices (“Yes”) compared to the total questions. 
		The percentage helps you see where you’re strongest and where you could improve.
	  </p>
  <table class="results-table">
		  <thead><tr><th>Category</th><th>Score</th><th>Percent</th></tr></thead>
		  <tbody>${catRows}</tbody>
		</table>
	  </details>
	`;
	

		  // After `topFive`, add this:
	const topRecSet = new Set(topFive.map(f => String(f.recommendation)));

	// Build grouped recommendations EXCLUDING anything already in Top 5, and dedupe globally
	let furtherCount = 0;
	const seenGlobal = new Set(topRecSet); // start by blocking the Top 5 recs
	const groupedRecs = Object.keys(recsByCategory).length
	  ? Object.entries(recsByCategory).map(([cat, set]) => {
		  const items = [];
		  Array.from(set).forEach(html => {
			if (!seenGlobal.has(html)) {
			  items.push(`<li>${html}</li>`);
			  seenGlobal.add(html);
			  furtherCount++;
			}
		  });
		  return items.length ? `<h5>${cat}</h5><ul>${items.join('')}</ul>` : '';
		}).join('')
	  : '';

	// Wrap “Further recommendations” in a collapsible details element
	const recommendationsHtml = furtherCount
	  ? `
		<details class="more-recs" role="group" aria-labelledby="more-recs-summary">
		  <summary id="more-recs-summary">Other things you could improve (${furtherCount})</summary>
		  <p class="more-recs-intro">These are extra steps you might want to look at after fixing the top 5.</p>
		  ${groupedRecs}
		</details>
	  `
	  : `<p><strong>You're doing great! No other immediate actions required at this time.</strong></p>`;


	  // Render results UI
	  const resultBox = document.getElementById('resultBox');
	  resultBox.className = `result ${riskClass}`;
	  resultBox.innerHTML = `
		<h3>${riskLevel}</h3>
		<p>You scored ${overall.safeCount} out of ${overall.total} (${Math.round(safePct)}%)</p>
		<p>${riskMessage}</p>
		${categoryTable}
		${topFiveHtml}
		${recommendationsHtml}
		<div class="result-actions" style="display:flex; gap:.5rem; margin-top:1rem; flex-wrap:wrap;">
		  <button class="btn nextBtn" onclick="CyberChecklist.downloadResultsJSON()">Download JSON</button>
		  <button class="btn nextBtn" onclick="CyberChecklist.downloadResultsCSV()">Download CSV</button>
		  <button class="btn nextBtn" onclick="CyberChecklist.restartChecklist()">Start Over</button>
		</div>
	  `;
	  resultBox.style.display = 'block';

	  // Progress indicator
	  document.getElementById('pageIndicator').textContent = 'Assessment Complete';
	  document.getElementById('progressFill').style.width = '100%';

	  // Persist the last results in memory for export
	  this._lastResults = { overall, categories, answers, unsafeFindings, topFive };
	},
	
		downloadResultsJSON() {
	  const payload = this._lastResults || {};
	  const wrap = {
		exportedAt: new Date().toISOString(),
		pages: this.pages,
		results: payload
	  };
	  this.downloadFile('cyberchecklist-results.json', 'application/json;charset=utf-8', JSON.stringify(wrap, null, 2));
	},

	downloadResultsCSV() {
	  const r = this._lastResults || {};
	  const { overall = {}, categories = {}, answers = [], topFive = [] } = r;

	  // 1) Overall line
	  const lines = [];
	  lines.push(['Section', 'Key', 'Value'].join(','));
	  lines.push(['Overall', 'Safe', overall.safeCount ?? ''].join(','));
	  lines.push(['Overall', 'Total', overall.total ?? ''].join(','));
	  const pct = (overall.total ? Math.round((overall.safeCount / overall.total) * 100) : 0);
	  lines.push(['Overall', 'Percent', pct].join(','));

	  // 2) Category breakdown
	  lines.push('');
	  lines.push(['Category', 'Safe', 'Total', 'Percent'].join(','));
	  Object.entries(categories).forEach(([cat, s]) => {
		const cpct = s.total ? Math.round((s.safe / s.total) * 100) : 0;
		lines.push([cat, s.safe, s.total, cpct].join(','));
	  });

	  // 3) Answers
	  lines.push('');
	  lines.push(['Answers'].join(','));
	  lines.push(['Question', 'Category', 'Answer'].join(','));
	  answers.forEach(a => {
		lines.push([`"${a.title.replace(/"/g, '""')}"`, a.category, a.value].join(','));
	  });

	  // 4) Top 5 fixes
	  lines.push('');
	  lines.push(['Top 5 Fixes (priority-desc)'].join(','));
	  lines.push(['Title', 'Category', 'Priority', 'Recommendation'].join(','));
	  topFive.forEach(f => {
		const title = `"${f.title.replace(/"/g, '""')}"`;
		const rec   = `"${String(f.recommendation).replace(/"/g, '""')}"`;
		lines.push([title, f.category, f.priority, rec].join(','));
	  });

	  this.downloadFile('cyberchecklist-results.csv', 'text/csv;charset=utf-8', lines.join('\n'));
	},

    restartChecklist() {
    // Reset form
    document.getElementById('checklist').reset();

    // Hide results
    const result = document.getElementById('resultBox');
    result.style.display = 'none';
    result.innerHTML = '';

    // Reset page state
    this.currentPage = 0;

    // Reset all pages: hide them and remove "active"
    this.pages.forEach(id => {
        const page = document.getElementById(id);
        page.style.display = '';
        page.classList.remove('active');
    });

    // Show navigation buttons
    document.querySelectorAll('.button-row').forEach(row => {
        row.style.display = 'flex';
    });

    // Reset accordion states
    document.querySelectorAll('.accordion-header').forEach(h => {
        h.classList.remove('active');
        h.setAttribute('aria-expanded', 'false');
        const icon = h.querySelector('.accordion-icon');
        if (icon) icon.textContent = '▼';
    });

    document.querySelectorAll('.accordion-content').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-hidden', 'true');
        c.style.maxHeight = null;
    });

    // Clear any error states
    this.clearErrorStates();

    // Show first page correctly
    this.showPage(this.currentPage);
}
};

// Create global alias for HTML onclick handlers
window.checklist = CyberChecklist;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => CyberChecklist.init());


