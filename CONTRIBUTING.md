# Contributing to EcoTrack AI

Thank you for helping individuals track and reduce their carbon footprint! To maintain code quality, security, and efficiency, please follow these guidelines:

## Code Quality Standards

* **Backend (Python)**:
  * Adhere to PEP 8 standards.
  * Use clear type-hinting where appropriate.
  * Ensure all active logic routes are protected with appropriate rate limits and validation.
* **Frontend (React)**:
  * Keep components modular and reusable.
  * Adhere to semantic HTML structure to preserve accessibility ratings (>95).
  * Use the class-based dark mode utility classes.

## Development Workflow

1. **Fork & Branch**: Create a feature branch matching your planned change (e.g. `feature/carbon-forecasting` or `bugfix/jwt-expiry`).
2. **Local Verification**:
   * Run backend unit tests using pytest: `pytest backend/tests/`
   * Validate frontend production compilation: `npm run build`
3. **Commit Messages**: Write descriptive commit messages referencing related issues.
4. **Pull Requests**: Open a pull request against the main branch. Ensure all continuous integration checks in the GitHub Actions pipeline pass before requesting reviews.
