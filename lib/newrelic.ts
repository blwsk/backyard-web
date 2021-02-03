declare global {
    interface Window {
      newrelic: any;
    }
  }
  
export const newrelic = () => window && window.newrelic ? window.newrelic : {
  addPageAction() {}
};
