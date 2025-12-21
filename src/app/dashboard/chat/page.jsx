import { CONFIG } from 'src/config-global';

import { ChatBooksView } from 'src/sections/chat-books/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Chat With Books - ${CONFIG.site.name}` };

export default function Page() {
  return <ChatBooksView />;
}

