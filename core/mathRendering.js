const jobs = new WeakMap();
const getMathJax = () => globalThis.window?.MathJax ?? globalThis.MathJax;

async function bounded(promise, timeoutMs) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise(resolve => { timer = setTimeout(() => resolve(false), timeoutMs); })
    ]);
  } finally { clearTimeout(timer); }
}

// One job per DOM target. Call clearMath before replacing its content.
export function renderMath(container, { targets = [container], timeoutMs = 3000 } = {}) {
  if (jobs.has(container)) return jobs.get(container).promise;
  const job = { targets, cancelled: false, mathJax: null };
  jobs.set(container, job);
  job.promise = (async () => {
    try {
      let mathJax = getMathJax();
      if (!mathJax?.typesetPromise && !mathJax?.startup?.promise) {
        const script = globalThis.document?.getElementById?.('MathJax-script');
        if (script?.addEventListener && script?.src) {
          let loaded, failed;
          try {
            await bounded(new Promise(resolve => {
              loaded = () => resolve(true);
              failed = () => resolve(false);
              script.addEventListener('load', loaded, { once: true });
              script.addEventListener('error', failed, { once: true });
            }), timeoutMs);
          } finally {
            script.removeEventListener('load', loaded);
            script.removeEventListener('error', failed);
          }
          mathJax = getMathJax();
        }
      }
      if (mathJax?.startup?.promise) {
        if (await bounded(Promise.resolve(mathJax.startup.promise).then(() => true), timeoutMs) === false) return false;
      }
      if (job.cancelled || typeof mathJax?.typesetPromise !== 'function') return false;
      job.mathJax = mathJax;
      await mathJax.typesetPromise(targets);
      return !job.cancelled;
    } catch (error) {
      console.warn('MathJax : échec de composition de la correction.', error);
      return false;
    } finally {
      // A pending composition may have registered items after initial cleanup.
      if (job.cancelled) clearTargets(job);
    }
  })();
  return job.promise;
}

function clearTargets(job) {
  try { (job.mathJax ?? getMathJax())?.typesetClear?.(job.targets); }
  catch (error) { console.warn('MathJax : échec du nettoyage de la correction.', error); }
}

export function clearMath(container) {
  const job = jobs.get(container);
  if (!job) return;
  job.cancelled = true;
  clearTargets(job);
  jobs.delete(container);
}
