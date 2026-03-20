/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format number to decimal places
 */
export const formatNumber = (number, decimals = 2) => {
  return parseFloat(number).toFixed(decimals)
}

/**
 * Format probability to percentage
 */
export const formatPercentage = (probability) => {
  return `${(probability * 100).toFixed(2)}%`
}

/**
 * Format BMI category
 */
export const formatBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}
