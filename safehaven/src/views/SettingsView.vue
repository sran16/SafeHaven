.settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.settings-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.settings-header h1 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.settings-section {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-soft);
}

.section-title {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--secondary-color);
}

.setting-item {
  margin-bottom: var(--spacing-lg);
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.setting-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--secondary-color);
  transition: var(--transition-fast);
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: var(--transition-fast);
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.save-btn {
  width: 100%;
  padding: var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 500;
  margin-top: var(--spacing-lg);
  transition: var(--transition-fast);
}

.save-btn:hover {
  background-color: #6b8a83;
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.danger-zone {
  margin-top: var(--spacing-xl);
}

.danger-zone .section-title {
  color: #E57373;
}

.delete-btn {
  width: 100%;
  padding: var(--spacing-md);
  background-color: #E57373;
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 500;
  transition: var(--transition-fast);
}

.delete-btn:hover {
  background-color: #ef5350;
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

@media (max-width: 320px) {
  .settings-section {
    padding: var(--spacing-lg);
  }

  .section-title {
    font-size: 1.1rem;
  }

  .setting-label {
    font-size: 0.9rem;
  }
} 