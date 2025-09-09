'use client'
import React from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter } from "@nextui-org/react";
import { Button } from '@/components/ui/button'
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies';
import { Input } from '@/components/ui/input';
import PermissionComponent from '@/components/ui/PermissionComponent'; 
import { PageProps } from '@/lib/shared/types/config';
import { TrashIcon } from 'lucide-react';

interface Props extends PageProps {
  onClickItem?: (e: any) => any
}
export default function ListStageMasterUsers(props: Props) {

  const [users, setUsers] = React.useState<any[]>([])
  const [total_pages, setTotal_pages] = React.useState(0);
  const [count, setCount] = React.useState(0)
  const [currentpage, setCurrentPage] = React.useState(1);
  const [onLoadDatas, setOnLoadDatas] = React.useState(false);
  const [search, setSearch] = React.useState("")
  const [isOpen, setIsOpen] = React.useState<"create" | "detail" | "update" | "delete" | undefined>(undefined);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [selectedUser, setSelectedUser] = React.useState<any>()

  const onItemSelected = (e: any) => {
    setSelectedUser(e);
    setIsOpen("detail");
  }

  const loads = async () => {
    setOnLoadDatas(true)
    try {
      const result = await api(cookies).post(`generic/isp_stage/stagemaster/?page=${currentpage}`, {
        action: "list",
        fields: {
          "stagemasterid": "id",
          "id": "user.id",
          "username": "user.username",
          "first_name": "user.first_name",
          "last_name": "user.last_name",
          "name": "user.name",
          "email": "user.email",
          "phone": "user.phone"
        }
      })
      setUsers(result.data.results)
      setTotal_pages(result.data.total_pages)
      setCount(result.data.count)

    } catch (e) {

    }
    setOnLoadDatas(false)
  }
  React.useEffect(() => {
    loads()
  }, [currentpage])

  React.useEffect(() => {
    if (error !== undefined) {
      setTimeout(() => { setError(undefined) }, 5000)
    }
  }, [error])

  const handleSubmit = () => {
    if (isOpen === "detail") return;
    setIsSaving(true)
    // e.preventDefault();
    const name: any = document.getElementById("name");
    const firstname: any = document.getElementById("firstname");
    const lastname: any = document.getElementById("lastname");
    const email: any = document.getElementById("email");
    const phonenumber: any = document.getElementById("phonenumber");

    const data = {
      name: name.value,
      firstname: firstname.value,
      lastname: lastname.value,
      email: email.value,
      phonenumber: phonenumber.value,
    }

    api(cookies).post(`/isp_stage/stage-master/`, {
      name: data.name,
      first_name: data.firstname,
      last_name: data.name,
      phone: data.phonenumber,
      email: data.email
    })
      .then(result => {
        console.log(result);
        setIsSaving(false);
        setIsOpen(undefined);
      })
      .catch(error => {
        console.log(error);
        setIsSaving(false)
        setError(error.message)
      })


    console.log(data)
  }

  const handleDelete = async () => {

  }

  const handleClose = () => {
    setIsOpen(undefined);
    setSelectedUser(undefined);
  }

  return (
    <>
      <div className='bg-white p-[10px] rounded shadow'>
        <div className='flex w-full gap-2 items-center mb-[15px]'>
          <div className='mt-[5px] flex-1'>
            <Input placeholder='Recherche' />
          </div>
          <PermissionComponent user={props.user} permissions={["isp_user_management"]} >
            <Button onClick={() => setIsOpen("create")}>Nouveau</Button>
          </PermissionComponent>
        </div>
        {
          onLoadDatas === false ? <Table className='shadow-0' shadow='none'>
            <TableHeader>
              <TableColumn>Nom</TableColumn>
              <TableColumn>Postnom</TableColumn>
              <TableColumn>Télephone</TableColumn>
            </TableHeader>
            <TableBody>
              {
                users.map(user => {
                  return (
                    <TableRow key={user.id} onClick={() => {
                      onItemSelected(user)
                    }
                    }>
                      <TableCell>{user.first_name}</TableCell>
                      <TableCell>{user.last_name}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                    </TableRow>
                  )
                })
              }
            </TableBody>

          </Table> : <div>
            <Spinner />
            <p>Chargement des données en cours...</p>
          </div>
        }

        <Pagination initialPage={1} total={total_pages} page={currentpage} onChange={(e) => setCurrentPage(e)} />
      </div>
      <Modal isOpen={isOpen !== undefined} onClose={() => setIsOpen(undefined)} size='2xl'>
        <ModalContent>
          <div>
            <ModalHeader>{isOpen === "create" ? "Ajouter" : ""} {isOpen === "update" ? "Modifier" : ""} un utisateur</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-[5px]">
                <Input type="text" placeholder="Nom" id="name" disabled={isOpen === "detail"} defaultValue={`${(isOpen === "update" || isOpen === "detail") ? `${selectedUser.name}` : ""}`} />
                <Input type="text" placeholder="Postnom" id="lastname" disabled={isOpen === "detail"} defaultValue={`${(isOpen === "update" || isOpen === "detail") ? `${selectedUser.last_name}` : ""}`} />
                <Input type="text" placeholder="Prénom" id="firstname" disabled={isOpen === "detail"} defaultValue={`${(isOpen === "update" || isOpen === "detail") ? `${selectedUser.first_name}` : ""}`} />
                <Input type="text" placeholder="Email" id="email" disabled={isOpen === "detail"} defaultValue={`${(isOpen === "update" || isOpen === "detail") ? `${selectedUser.email}` : ""}`} />
                <Input type="text" placeholder="Téléphone" id="phonenumber" required disabled={isOpen === "detail"} defaultValue={`${(isOpen === "update" || isOpen === "detail") ? `${selectedUser.phone}` : ""}`} />
              </div>
            </ModalBody>
            <ModalFooter>
              {
                error !== undefined ? <p>{error}</p> : <>
                  {
                    isSaving === false ? <div className='flex flex-1 w-full gap-[10px] items-center'>
                      {
                        isOpen === "delete" ? <div className='flex w-full flex-1'>
                          <div className='flex-1'>
                            <p className="m-0 text-[12px] text-gray-400">Vous etes sur le point de supprimer ce compte.</p>
                            <p className="m-0 text-[12px] text-gray-400">Voulez-vous poursuivre ? <button className="text-red-400 font-bold" onClick={handleDelete}>Supprimer</button></p>
                          </div>
                          <div>
                            <p className="text-[12px] text-gray-400 font-bold cursor-pointer" onClick={() => setIsOpen("detail")} >Annuler</p>
                          </div>

                        </div> : <>
                          <div className="flex items-center cursor-pointer gap-[5px]">
                            <p className='text-[12px] text-gray-400 flex gap-[5px]' onClick={() => setIsOpen("delete")}><TrashIcon size={"14px"} className="cursor-pointer" /> Supprimer</p>
                          </div>

                          <div className="flex flex-1 items-center justify-end gap-[10px]">
                            <p className="text-gray-400 cursor-pointer" onClick={() => {
                              if (isOpen === "update") setIsOpen("detail");
                              else handleClose();
                            }}>Annuler</p>
                            <Button onClick={() => {
                              if (isOpen === "detail") setIsOpen("update")
                              else handleSubmit()
                            }}>{isOpen === "detail" ? "Modifier" : "Ajouter"}</Button>
                          </div>

                        </>}
                    </div> : <div className='flex items-center gap-[10px]'>
                      <Spinner />
                      <p>Enregistrement en cours...</p>
                    </div>
                  }</>
              }
            </ModalFooter>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
