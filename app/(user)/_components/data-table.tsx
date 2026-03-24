import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
const DataTable = () => {
  return (
    <Table className="border border-input">
      <TableHeader>
        <TableRow>
          <TableHead className="rounded-md">
            <Checkbox />
          </TableHead>
          <TableHead>No</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 10 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Checkbox />
            </TableCell>
            <TableCell>{index + 1}</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>john.doe@example.com</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default DataTable
