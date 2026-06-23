/**
 * PAWSURE - DASHBOARD & INTERACTIVE JAVASCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {
  initFileUpload();
  initFormValidation();
  initToastSystem();
  initClaimFormSteps();
  initChartAnimations();
});

/* --------------------------------------------------------------------------
   FILE UPLOAD
   -------------------------------------------------------------------------- */
function initFileUpload() {
  const dropZones = document.querySelectorAll('.upload-zone');
  
  dropZones.forEach(zone => {
    const input = zone.querySelector('input[type="file"]');
    if (!input) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      zone.addEventListener(eventName, () => {
        zone.classList.add('is-dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, () => {
        zone.classList.remove('is-dragover');
      }, false);
    });

    zone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files, zone);
      input.files = files; // Assign files to input
    }, false);

    input.addEventListener('change', function() {
      handleFiles(this.files, zone);
    });
  });
}

function handleFiles(files, zone) {
  if (!files.length) return;
  const label = zone.querySelector('.upload-label');
  if (label) {
    if (files.length === 1) {
      label.textContent = files[0].name;
    } else {
      label.textContent = `${files.length} files selected`;
    }
  }
}

/* --------------------------------------------------------------------------
   FORM VALIDATION
   -------------------------------------------------------------------------- */
function initFormValidation() {
  const forms = document.querySelectorAll('.needs-validation');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        // Prevent default for demo, show toast
        e.preventDefault();
        
        // Show spinner on button
        const btn = form.querySelector('button[type="submit"]');
        if (btn) {
          const originalText = btn.innerHTML;
          btn.innerHTML = '<span class="spinner ph-spinner ph-spin"></span> Processing...';
          btn.disabled = true;
          
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            showToast('Success', 'Action completed successfully.', 'success');
            form.reset();
          }, 1500);
        }
      }
      
      form.classList.add('was-validated');
      
      // Custom checks
      validateCustomFields(form);

    }, false);

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (form.classList.contains('was-validated')) {
          validateInput(input);
        }
      });
    });
  });
}

function validateInput(input) {
  if (input.checkValidity()) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
  } else {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
  }
}

function validateCustomFields(form) {
  // Password match check
  const password = form.querySelector('input[name="password"]');
  const confirmPassword = form.querySelector('input[name="confirmPassword"]');
  
  if (password && confirmPassword) {
    if (password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity("Passwords do not match");
      validateInput(confirmPassword);
    } else {
      confirmPassword.setCustomValidity("");
      validateInput(confirmPassword);
    }
  }
}

/* --------------------------------------------------------------------------
   TOAST SYSTEM
   -------------------------------------------------------------------------- */
function initToastSystem() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
}

window.showToast = function(title, message, type = 'info') {
  const container = document.querySelector('.toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} slide-in`;
  
  let icon = 'ph-info';
  if (type === 'success') icon = 'ph-check-circle';
  if (type === 'error') icon = 'ph-x-circle';

  toast.innerHTML = `
    <div class="toast-icon"><i class="${icon}"></i></div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close"><i class="ph-x"></i></button>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  });

  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
};

/* --------------------------------------------------------------------------
   CLAIM FORM STEPS
   -------------------------------------------------------------------------- */
function initClaimFormSteps() {
  const steps = document.querySelectorAll('.claim-step');
  const nextBtns = document.querySelectorAll('.btn-next-step');
  const prevBtns = document.querySelectorAll('.btn-prev-step');
  const indicators = document.querySelectorAll('.step-indicator');
  
  if (!steps.length) return;

  let currentStep = 0;

  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
    });
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === index);
      ind.classList.toggle('completed', i < index);
    });
  }

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Basic validation before next
      const currentStepEl = steps[currentStep];
      const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
      let valid = true;
      inputs.forEach(input => {
        if (!input.checkValidity()) {
          valid = false;
          input.classList.add('is-invalid');
        } else {
          input.classList.remove('is-invalid');
        }
      });

      if (valid && currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   CHART ANIMATIONS
   -------------------------------------------------------------------------- */
function initChartAnimations() {
  const bars = document.querySelectorAll('.chart-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetHeight = el.getAttribute('data-height');
        el.style.height = targetHeight + '%';
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => {
    bar.style.height = '0%';
    observer.observe(bar);
  });
}
