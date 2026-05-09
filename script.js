const fields = Array.from(document.querySelectorAll('input'));

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function percent(value) {
  return `${value.toFixed(1)}%`;
}

function num(id) {
  return Number(document.getElementById(id).value) || 0;
}

function updateDashboard() {
  const income = num('income');
  const fixed = num('fixed');
  const variable = num('variable');
  const debt = num('debt');
  const totalExpenses = fixed + variable + debt;
  const netCash = income - totalExpenses;
  const savingsRate = income ? (netCash / income) * 100 : 0;
  const dti = income ? (debt / income) * 100 : 0;

  const emergencyTarget = num('emergencyTarget');
  const emergencyCurrent = num('emergencyCurrent');
  const emergencyPct = emergencyTarget ? (emergencyCurrent / emergencyTarget) * 100 : 0;

  document.getElementById('netCash').textContent = money(netCash);
  document.getElementById('savingsRate').textContent = percent(savingsRate);
  document.getElementById('dtiRatio').textContent = percent(dti);
  document.getElementById('emergencyProgress').textContent = percent(Math.min(emergencyPct, 100));

  const categories = ['housing', 'food', 'transport', 'utilities', 'entertainment', 'other'];
  const totalPct = categories.reduce((sum, id) => sum + num(id), 0);
  const breakdownNote = document.getElementById('breakdownNote');
  if (totalPct === 100) {
    breakdownNote.textContent = 'Great! Your spending categories add up to 100%.';
    breakdownNote.style.color = '#15803d';
  } else {
    const diff = totalPct - 100;
    breakdownNote.textContent = `Spending categories are ${diff > 0 ? 'over' : 'under'} by ${Math.abs(diff).toFixed(1)}%.`;
    breakdownNote.style.color = '#b45309';
  }

  const retirementContribution = num('retirementContribution');
  const annualReturn = num('annualReturn') / 100;
  const months = 12;
  const monthlyRate = annualReturn / months;
  let projectedOneYear = 0;
  for (let i = 0; i < months; i += 1) {
    projectedOneYear = (projectedOneYear + retirementContribution) * (1 + monthlyRate);
  }
  document.getElementById('projection').textContent = `Estimated value of new retirement contributions in 12 months: ${money(projectedOneYear)} (assuming ${percent(annualReturn * 100)} annual return).`;
}

fields.forEach((field) => field.addEventListener('input', updateDashboard));
updateDashboard();
