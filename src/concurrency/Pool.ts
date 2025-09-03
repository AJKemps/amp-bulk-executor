import pLimit from 'p-limit';
import { PoolOptions } from '../types.js';

export async function runWithPool<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  options: PoolOptions
): Promise<R[]> {
  const limit = pLimit(options.concurrency);
  
  const promises = items.map(item => 
    limit(() => worker(item))
  );
  
  return Promise.all(promises);
}
