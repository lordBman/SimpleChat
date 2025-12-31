import React, { useState, useEffect } from 'react';
import SlideInTab from '../sliders/slidein-tab';


// Example usage component
const SlideInTabDemo: React.FC = () => {
  const [isTabOpen, setIsTabOpen] = useState(false);

  // Demo content styles
  const demoContentStyles: React.CSSProperties = {
    padding: '20px',
  };

  const buttonStyles: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const demoTextStyles: React.CSSProperties = {
    lineHeight: '1.6',
    color: '#333',
  };

  const demoListStyles: React.CSSProperties = {
    listStyleType: 'none',
    padding: 0,
    margin: '16px 0',
  };

  const demoListItemStyles: React.CSSProperties = {
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  };

  return (
    <div style={demoContentStyles}>
      <h1>Slide-in Tab Demo</h1>
      <button
        style={buttonStyles}
        onClick={() => setIsTabOpen(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#0056b3';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#007bff';
        }}
      >
        Open Slide-in Tab
      </button>

      <SlideInTab
        isOpen={isTabOpen}
        onClose={() => setIsTabOpen(false)}
        title="Information Panel">
        <div style={demoTextStyles}>
          <p>This is a slide-in panel that appears from the right.</p>
          
          <ul style={demoListStyles}>
            <li style={demoListItemStyles}>✅ Responsive design</li>
            <li style={demoListItemStyles}>✅ Smooth animations</li>
            <li style={demoListItemStyles}>✅ Escape key support</li>
            <li style={demoListItemStyles}>✅ Click outside to close</li>
            <li style={demoListItemStyles}>✅ Accessible</li>
          </ul>
          
          <p>
            The panel has a maximum width of 250px and includes a close button
            that slides it out of view.
          </p>
        </div>
      </SlideInTab>

      <div style={{ marginTop: '20px', ...demoTextStyles }}>
        <h2>Features:</h2>
        <ul style={demoListStyles}>
          <li style={demoListItemStyles}>Smooth slide-in/out animation</li>
          <li style={demoListItemStyles}>Backdrop overlay</li>
          <li style={demoListItemStyles}>Close on Escape key press</li>
          <li style={demoListItemStyles}>Close on backdrop click</li>
          <li style={demoListItemStyles}>Hover effects on close button</li>
          <li style={demoListItemStyles}>Prevents body scroll when open</li>
          <li style={demoListItemStyles}>Fully accessible with ARIA attributes</li>
        </ul>
      </div>
    </div>
  );
};

export { SlideInTab, SlideInTabDemo };
export default SlideInTab;