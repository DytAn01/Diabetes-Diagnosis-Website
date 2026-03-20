export default function RiskBadge({ prediction, probability }) {
  const isDiabetes = prediction === 1
  const riskPercentage = (probability * 100).toFixed(2)

  return (
    <div className={`p-6 rounded-lg text-white text-center ${
      isDiabetes ? 'bg-red-500' : 'bg-green-500'
    }`}>
      <h2 className="text-2xl font-bold mb-2">
        {isDiabetes ? '⚠️ Diabetes Risk Detected' : '✅ Low Risk'}
      </h2>
      <p className="text-lg">Risk Probability: {riskPercentage}%</p>
    </div>
  )
}
