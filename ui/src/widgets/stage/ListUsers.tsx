'use client'
import React from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from "@nextui-org/react";
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies';

interface Props { 
  onClickItem?: (e: any) => any
}
export default function ListUsers(props: Props) {

  const [users, setUsers] = React.useState<any[]>([])
  const [total_pages, setTotal_pages] = React.useState(0);
  // const [count, setCount] = React.useState(0)
  const [current_page, setCurrentPage] = React.useState(1);

  const load = async ()=>{
    api(cookies).get(`/isp_stage/dept-recherche-officier/?page=${current_page}`)
      .then(result => {
        setUsers(result.data.results)
        // setCount(result.data.count)
        setTotal_pages(result.data.total_pages)
      })
  }

  React.useEffect(() => {
    load()
  }, [current_page])

  


  return (
    <div>
      <Table shadow='none'>
        <TableHeader>
          <TableColumn>Nom</TableColumn>
          <TableColumn>Postnom</TableColumn>
          <TableColumn>Departement</TableColumn>
          <TableColumn>Télephone</TableColumn>
        </TableHeader>
        <TableBody>
          {
            users.map(user => {
              return (
                <TableRow key={user.id} onClick={() => {
                  props.onClickItem && props.onClickItem(user)
                }
                }>
                  <TableCell>{user.user?.first_name}</TableCell>
                  <TableCell>{user.user?.last_name}</TableCell>
                  <TableCell>{user.dept.libelle}</TableCell>
                  <TableCell>{user.user?.phone}</TableCell>
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
      <Pagination initialPage={1} total={total_pages} onChange={setCurrentPage} />
    </div>
  );
}
