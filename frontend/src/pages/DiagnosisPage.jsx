import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient'

export default function DiagnosisPage() {
  const [formData, setFormData] = useState({
    glucose: 0,
    hba1c: 0,
    bmi: 0,
    blood_pressure: 0,
    waist: 0,
    age: 0,
    family_history: 0,
    insulin: 0,
    skin_thickness: 0,
    pregnancies: 0,
    note: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    const textFields = ['note']
    const intFields = ['age', 'pregnancies', 'family_history']

    setFormData(prev => {
      if (textFields.includes(name)) {
        return { ...prev, [name]: value }
      }
      if (intFields.includes(name)) {
        return { ...prev, [name]: parseInt(value, 10) || 0 }
      }
      return { ...prev, [name]: parseFloat(value) || 0 }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axiosClient.post('/predict/', formData)
      navigate('/result', { 
        state: { 
          prediction: response.data.prediction,
          probability: response.data.probability,
          message: response.data.message
        }
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'glucose', label: 'Glucose Level (mg/dL)', min: 0, step: 1 },
    { name: 'hba1c', label: 'HbA1c (%)', min: 0, step: 0.1 },
    { name: 'bmi', label: 'BMI (kg/m²)', min: 0, step: 0.1 },
    { name: 'blood_pressure', label: 'Blood Pressure (mmHg)', min: 0, step: 1 },
    { name: 'waist', label: 'Waist Circumference (cm)', min: 0, step: 0.1 },
    { name: 'age', label: 'Age (years)', min: 0, step: 1 },
    { name: 'family_history', label: 'Family History (0=No, 1=Yes)', min: 0, step: 1 },
    { name: 'insulin', label: 'Insulin Level (mIU/L)', min: 0, step: 1 },
    { name: 'skin_thickness', label: 'Skin Thickness (mm)', min: 0, step: 1 },
    { name: 'pregnancies', label: 'Number of Pregnancies', min: 0, step: 1 }
  ]

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Diabetes Diagnosis Form</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-gray-700 font-bold mb-2">
                {field.label}
              </label>
              <input
                type="number"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                min={field.min}
                step={field.step}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="block text-gray-700 font-bold mb-2">Note (optional)</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Get Diagnosis'}
        </button>
      </form>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">📋 How to fill this form:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Glucose: Fasting blood glucose level</li>
          <li>• Blood Pressure: Diastolic blood pressure reading</li>
          <li>• BMI: Weight in kg divided by height in meters squared</li>
          <li>• All values should be from recent medical tests</li>
        </ul>
      </div>
    </div>
  )
}
