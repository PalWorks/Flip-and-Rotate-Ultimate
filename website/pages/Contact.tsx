import React, { useEffect } from 'react';

export const Contact: React.FC = () => {
    useEffect(() => {
        // Load Tally script
        const scriptSrc = "https://tally.so/widgets/embed.js";
        const d = document;

        if (d.querySelector(`script[src="${scriptSrc}"]`)) {
            return;
        }

        const s = d.createElement("script");
        s.src = scriptSrc;
        s.async = true;
        d.body.appendChild(s);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-white">
            <iframe
                data-tally-src="https://tally.so/r/81zXEl?transparentBackground=1&formEventsForwarding=1"
                width="100%"
                height="100%"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Flip & Rotate Ultimate - Get in Touch Form"
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, border: 0 }}
            ></iframe>
        </div>
    );
};
