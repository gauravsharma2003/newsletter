import React, { useState } from 'react';
import axios from 'axios';
import View from './view';

function Get() {
  const [urls, setUrls] = useState([
    'https://timesofindia.indiatimes.com/india/india-terminates-cargo-trans-shipment-to-bangladesh-in-sharp-rebuke-to-muhammad-yunus-landlocked-remark-china-and-northeast/articleshow/120126015.cms',
    'https://timesofindia.indiatimes.com/sports/cricket/ipl/top-stories/preity-zinta-spotted-with-new-punjab-kings-hero-priyansh-arya-in-viral-clip/articleshow/120130236.cms',
    'https://timesofindia.indiatimes.com/sports/chess/how-a-room-full-of-grandmasters-put-an-end-to-fide-vs-freestyle-chess-row/articleshow/120122985.cms',
    'https://timesofindia.indiatimes.com/india/chand-pe-daag-hai-unpe-ek-bhi-nahin-hai-kangana-ranaut-hails-pm-modi/articleshow/120130290.cms',
    'https://timesofindia.indiatimes.com/india/woman-shot-dead-by-husband-in-bihar-locals-say-she-is-union-minister-manjhis-kin/articleshow/120130583.cms',
    'https://timesofindia.indiatimes.com/india/lightning-strikes-kill-13-in-four-districts-of-bihar-cm-announces-rs-4-lakh-compensation/articleshow/120131410.cms'
  ]);
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingTime, setLoadingTime] = useState(0);

  const extractMsids = (urls) => {
    return urls
      .filter(url => url.trim())
      .map(url => {
        const match = url.match(/articleshow\/(\d+)\.cms/);
        return match ? match[1] : null;
      })
      .filter(msid => msid !== null);
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const makeAPICall = async (msidString) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 160000); // 40 second timeout

    try {
      const response = await axios.get(
        `https://nprelease.indiatimes.com/til-ai/api/6@6/news?msids=${msidString}`,
        {
          signal: controller.signal,
          timeout: 160000,
        }
      );
      console.log(response);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        throw new Error('Request timed out after 40 seconds. Please try again.');
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLoadingTime(0);

    // Start loading timer
    const timer = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);

    try {
      const msids = extractMsids(urls);
      if (msids.length === 0) {
        throw new Error('No valid msids found in the input');
      }

      const msidString = msids.join(',');
      const response = await makeAPICall(msidString);
      
      // Add default lead image if not present in response
      const dataWithDefaultImage = {
        ...response.data,
        leadimage: response.data.leadimage || 'https://static.toiimg.com/photo/120069788.cms'
      };
      
      setNewsData(dataWithDefaultImage);
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(timer);
      setLoading(false);
      setLoadingTime(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="w-full max-w-[700px] mx-auto">
        {!newsData ? (
          <>
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex flex-col gap-4">
                {urls.map((url, index) => (
                  <input
                    key={index}
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder={[
                      "Enter URL for Most Popular Story (e.g., https://timesofindia.indiatimes.com/.../articleshow/123456789.cms)",
                      "Enter URL for Local Story (e.g., https://timesofindia.indiatimes.com/.../articleshow/123456789.cms)",
                      "Enter URL for Global Story (e.g., https://timesofindia.indiatimes.com/.../articleshow/123456789.cms)",
                      "Enter URL for Business Story (e.g., https://timesofindia.indiatimes.com/.../articleshow/123456789.cms)",
                      "Enter URL for Sports Story (e.g., https://timesofindia.indiatimes.com/.../articleshow/123456789.cms)",
                      "Enter URL for Tech Story (e.g., https://timesofindia.indiatimes.com/.../articleshow/123456789.cms)"
                    ][index]}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                ))}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#E3272A] text-white rounded-lg hover:bg-[#B31F22] disabled:opacity-50 self-end"
                >
                  {loading ? 'Loading...' : 'Submit'}
                </button>
              </div>
            </form>

            {error && (
              <div className="p-4 mb-8 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {loading && (
              <div className="p-4 mb-8 bg-blue-50 text-blue-700 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Fetching news data... This may take up to 30 seconds</span>
                </div>
                {loadingTime > 5 && (
                  <p className="mt-2 text-sm text-center">
                    Still processing... ({loadingTime} seconds elapsed)
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <View data={newsData} />
        )}
      </div>
    </div>
  );
}

export default Get;
