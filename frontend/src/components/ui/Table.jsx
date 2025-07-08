const Table = ({ children, className = "", ...props }) => (
  <div className="w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ children, className = "", ...props }) => (
  <thead className={`border-b ${className}`} {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, className = "", ...props }) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>
    {children}
  </tbody>
);

const TableFooter = ({ children, className = "", ...props }) => (
  <tfoot className={`border-t bg-muted/50 font-medium ${className}`} {...props}>
    {children}
  </tfoot>
);

const TableRow = ({ children, className = "", ...props }) => (
  <tr
    className={`border-b transition-colors hover:bg-gray-800/50 data-[state=selected]:bg-muted ${className}`}
    {...props}
  >
    {children}
  </tr>
);

const TableHead = ({ children, className = "", ...props }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = "", ...props }) => (
  <td
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </td>
);

const TableCaption = ({ children, className = "", ...props }) => (
  <caption
    className={`mt-4 text-sm text-muted-foreground ${className}`}
    {...props}
  >
    {children}
  </caption>
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
