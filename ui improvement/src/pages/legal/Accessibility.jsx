import LegalPage from "../../components/layout/LegalPage";

export default function Accessibility() {
  return (
    <LegalPage title="Accessibility Statement" updated="April 2025">
      <h2>Our commitment</h2>
      <p>U2INVEST is committed to making our platform accessible to all users, including those with disabilities. We aim to meet WCAG 2.1 Level AA guidelines.</p>

      <h2>Measures we take</h2>
      <ul>
        <li>Keyboard navigable interface throughout</li>
        <li>Sufficient colour contrast on all text elements</li>
        <li>Focus indicators on interactive elements</li>
        <li>Semantic HTML structure for screen reader compatibility</li>
        <li>Alt text on meaningful images</li>
        <li>Responsive design for mobile and assistive technology users</li>
      </ul>

      <h2>Known limitations</h2>
      <p>Some third-party content (e.g. embedded videos) may not fully comply with accessibility standards. We work to mitigate these where possible.</p>

      <h2>Feedback</h2>
      <p>If you experience any accessibility barriers on U2INVEST, please contact us at hello@u2invest.com. We take all feedback seriously and will respond within 5 business days.</p>
    </LegalPage>
  );
}