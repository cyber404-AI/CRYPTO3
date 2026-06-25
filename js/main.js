document.addEventListener('DOMContentLoaded', () => {
  // Navigation active state highlight based on path name
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.endsWith(href) || (currentPath.endsWith('/') && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Contact form submission logic
  const contactForm = document.getElementById('contactForm');
  const submitAlert = document.getElementById('submitAlert');
  if (contactForm && submitAlert) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending Message...';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        contactForm.reset();
        
        submitAlert.style.display = 'block';
        submitAlert.style.animation = 'fadeIn 0.3s ease forwards';
        
        setTimeout(() => {
          submitAlert.style.display = 'none';
        }, 5000);
      }, 1200);
    });
  }

  // Counter animation for About page stats
  const stats = document.querySelectorAll('.stat-num');
  if (stats.length > 0) {
    const animateStats = () => {
      stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'), 10);
        const suffix = stat.getAttribute('data-suffix') || '';
        let current = 0;
        const duration = 1500; // 1.5s
        const stepTime = Math.max(Math.floor(duration / target), 15);
        
        const timer = setInterval(() => {
          current += Math.ceil(target / (duration / stepTime));
          if (current >= target) {
            clearInterval(timer);
            stat.textContent = target + suffix;
          } else {
            stat.textContent = current + suffix;
          }
        }, stepTime);
      });
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    const visualSection = document.querySelector('.about-visual');
    if (visualSection) {
      observer.observe(visualSection);
    } else {
      animateStats(); // Fallback
    }
  }
});
