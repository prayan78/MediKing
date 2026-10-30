import React, { useEffect, useState } from 'react';
import { toAdDateFromBs, toBsDateString } from '../utils/nepaliDate';

export default function SystemDateInput({ value, onChange, className = '', ...props }) {
  const [dateSystem, setDateSystem] = useState(
    () => localStorage.getItem('mediking_date_system') || 'AD'
  );
  const [bsDraft, setBsDraft] = useState(null);
  const bsValue = bsDraft && bsDraft.sourceValue === value ? bsDraft.text : toBsDateString(value);

  useEffect(() => {
    const syncDateSystem = (event) => {
      setDateSystem(event.detail || localStorage.getItem('mediking_date_system') || 'AD');
    };
    window.addEventListener('date-system-changed', syncDateSystem);
    return () => window.removeEventListener('date-system-changed', syncDateSystem);
  }, []);

  if (dateSystem !== 'BS') {
    return (
      <input
        {...props}
        type="date"
        value={value || ''}
        onChange={onChange}
        className={className}
      />
    );
  }

  const handleBsChange = (event) => {
    const enteredValue = event.target.value;
    setBsDraft({ sourceValue: value, text: enteredValue });
    const adDate = toAdDateFromBs(enteredValue);
    event.target.setCustomValidity(adDate || !enteredValue
      ? ''
      : 'Enter a valid B.S. date in YYYY/MM/DD format.');
    if (adDate) onChange({ target: { value: adDate } });
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="YYYY/MM/DD (B.S.)"
      value={bsValue}
      onChange={handleBsChange}
      className={className}
      aria-label={props['aria-label'] || 'Date in Bikram Sambat format'}
    />
  );
}
