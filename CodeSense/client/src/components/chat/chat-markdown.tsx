import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatMarkdown({ children }: { children: string }) {
  return (
    <div className="markdown-body min-w-0 text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
          pre: ({ ...props }) => <pre {...props} tabIndex={0} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
