import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const withSettingsCheck = (WrappedComponent) => {
  return (props) => {
    const navigate = useNavigate();
    const settings = useSelector((state) => state.settingsStore);
    const settingsCompleted = settings.senderName && settings.senderEmail && settings.senderAddress && settings.productId && settings.token && settings.phoneId; // Check all required fields

    React.useEffect(() => {
      if (!settingsCompleted) {
        navigate('/settings');
      }
    }, [settingsCompleted, navigate]);

    return settingsCompleted ? <WrappedComponent {...props} /> : null;
  };
};

export default withSettingsCheck;
