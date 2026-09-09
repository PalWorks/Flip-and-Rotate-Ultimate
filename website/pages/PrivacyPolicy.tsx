import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Overview</h2>
          <p className="text-slate-600 leading-relaxed">
            Flip, Rotate and Mirror Ultimate ("we", "our", or "us") respects your privacy. This Privacy Policy describes how we handle information when you use our Chrome Extension. 
            <strong>In short: the extension collects nothing and sends nothing anywhere. This website, which is separate, uses analytics, and section 3 says exactly which.</strong>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. The Extension</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            The extension runs entirely on your device. It makes no network requests of any kind, so
            no data about you or the pages you visit ever leaves your browser.
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>We do <strong>not</strong> track your browsing history.</li>
            <li>We do <strong>not</strong> collect usage analytics from the extension.</li>
            <li>We do <strong>not</strong> require user registration.</li>
            <li>We do <strong>not</strong> store cookies related to tracking.</li>
            <li>We do <strong>not</strong> transmit page content anywhere.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-4">
            The only setting the extension stores is whether animations are enabled. It is kept in
            Chrome&rsquo;s own <code>storage.sync</code> and never reaches us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. This Website</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            This website is separate from the extension and, unlike the extension, it does use
            analytics. We state this plainly rather than leave it implied by the section above.
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>
              <strong>Google Analytics 4</strong> for aggregate traffic measurement, such as page
              views and referrers.{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Google&rsquo;s privacy policy</a>.
            </li>
            <li>
              <strong>Microsoft Clarity</strong> for anonymised session replay and heatmaps, used to
              find usability problems on these pages.{' '}
              <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Microsoft&rsquo;s privacy statement</a>.
            </li>
            <li>
              <strong>Tally</strong> forms are embedded on the contact and uninstall feedback pages.
              Anything you type into those forms is submitted to Tally.{' '}
              <a href="https://tally.so/help/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Tally&rsquo;s privacy policy</a>.
            </li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-4">
            None of this applies to the extension. Installing the extension does not subject you to
            any of the above; it only applies while you are browsing this website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Extension Permissions</h2>
          <p className="text-slate-600 leading-relaxed mb-2">
            The extension requires the following permissions to function:
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li><strong>activeTab:</strong> Required to inject the CSS transforms needed to flip/rotate elements on the page you are currently viewing.</li>
            <li><strong>scripting:</strong> Required to execute the javascript logic that handles the rotation.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Local Storage</h2>
          <p className="text-slate-600 leading-relaxed">
            We may use Chrome's local storage API solely to save your user preferences (e.g., if you prefer a dark mode interface for the extension popup). This data never leaves your browser.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us via our GitHub repository or email us.
          </p>
        </section>
      </div>
    </div>
  );
};