const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://api-monitoring-app-production.up.railway.app'}/api`;

export const loginUser = async (email, password) => {
  console.log('Sending login request to API:', { email, password });
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  console.log('Received response from API:', data);
  if (!res.ok) throw new Error(data.msg || 'Login failed');
  return data;
};

export const downloadPDF = async (monitorId, alertId) => {
  try {
    const response = await fetch(
      `${API_URL}/monitor/${monitorId}/alert/${alertId}/pdf`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) throw new Error('Failed to download PDF');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `alert-${alertId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (err) {
    console.error('❌ PDF Download Error:', err);
    alert('Failed to download PDF.');
  }
};

