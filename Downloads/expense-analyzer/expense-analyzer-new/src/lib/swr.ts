import { SWRConfig } from 'swr';

export const swrConfig = {
  fetcher: (url: string) => fetch(url).then(res => res.json()),
  revalidateOnFocus: false,
  revalidateOnReconnect: false
}; 