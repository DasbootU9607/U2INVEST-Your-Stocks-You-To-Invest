import LegalPage from "../../components/layout/LegalPage";

export default function RiskDisclosure() {
  return (
    <LegalPage title="Risk Disclosure" updated="April 2025">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 my-6">
        <p className="text-sm text-amber-800 font-medium">Important: Read this disclosure carefully before using U2INVEST.</p>
      </div>

      <h2>General investment risk</h2>
      <p>All investing involves risk, including the potential loss of principal. Past performance is not indicative of future results. The value of investments can go down as well as up.</p>

      <h2>Educational platform only</h2>
      <p>U2INVEST is a financial education platform. We do not facilitate real trading. We do not hold client funds. We are not regulated as a financial services firm or investment adviser in any jurisdiction.</p>

      <h2>Trading simulation risk</h2>
      <p>The Trading Lab uses simulated capital. Results achieved in the simulation may not reflect what would happen in real markets, due to factors including slippage, liquidity, market impact, psychological pressure, and real-money decision-making dynamics.</p>

      <h2>AI and data risk</h2>
      <p>U2CHAT is powered by artificial intelligence. AI-generated responses can contain errors, hallucinations, or outdated information. Market data may be delayed. Do not rely solely on U2CHAT outputs for any financial decision.</p>

      <h2>Regulatory notice</h2>
      <p>U2INVEST does not provide regulated financial advice. If you require personalised investment advice, please consult a qualified and regulated financial adviser in your jurisdiction.</p>

      <h2>User responsibility</h2>
      <p>You are solely responsible for any financial decisions you make. U2INVEST accepts no responsibility for decisions made based on content consumed on this platform.</p>
    </LegalPage>
  );
}