document.addEventListener('DOMContentLoaded', function () {

  // ─── Scroll Progress Bar ────────────────────────────────────────────────────
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  // ─── IntersectionObserver: Active Section Tracking ──────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
  const progressCounter = document.querySelector('.sidebar-progress');
  const totalSections = sections.length;

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');

          // Update active nav link
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });

          // Update progress counter
          if (progressCounter) {
            const sectionIndex = Array.from(sections).indexOf(entry.target) + 1;
            progressCounter.textContent = 'Section ' + sectionIndex + ' of ' + totalSections;
          }
        }
      });
    }, {
      rootMargin: '-20% 0px -75% 0px'
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // ─── Copy to Clipboard ───────────────────────────────────────────────────────
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Find the associated pre block — sibling or within same .code-header container
      let code = '';
      const header = btn.closest('.code-header');
      if (header && header.nextElementSibling && header.nextElementSibling.tagName === 'PRE') {
        code = header.nextElementSibling.textContent || '';
      } else {
        const pre = btn.closest('pre');
        if (pre) code = pre.textContent || '';
      }

      navigator.clipboard.writeText(code).then(function () {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(function () {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

  // ─── Mobile Sidebar Toggle ───────────────────────────────────────────────────
  const mobileToggle = document.querySelector('.mobile-toggle');
  const sidebar = document.querySelector('.sidebar');

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });

    // Close sidebar when a nav link is clicked on mobile
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        sidebar.classList.remove('open');
      });
    });
  }

});
