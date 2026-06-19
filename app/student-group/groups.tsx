"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Rodal from "rodal"
import "rodal/lib/rodal.css"

type Group = {
  id: number
  name: string
  active: boolean
}

type Student = {
  id: number
  fullname: string
  age: number
  email: string
  active: boolean
  group_id: number
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [students, setStudents] = useState<Student[]>([])

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [studentGroupId, setStudentGroupId] = useState<number>(0)

  const [search, setSearch] = useState("")

  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [studentModalOpen, setStudentModalOpen] = useState(false)

  const [groupName, setGroupName] = useState("")

  const [fullname, setFullname] = useState("")
  const [age, setAge] = useState("")
  const [email, setEmail] = useState("")
  const [active, setActive] = useState(false)

  useEffect(() => {
    getGroups()
  }, [])

  const getGroups = async () => {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.log("Guruhlarni olishda xatolik:", error)
      return
    }

    setGroups(data || [])
  }

  const getStudentsByGroup = async (groupId: number) => {
    setSelectedGroupId(groupId)

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("group_id", groupId)
      .order("id", { ascending: true })

    if (error) {
      console.log("O'quvchilarni olishda xatolik:", error)
      return
    }

    setStudents(data || [])
  }

  const addGroup = async () => {
    if (!groupName.trim()) return

    const { data, error } = await supabase
      .from("groups")
      .insert([
        {
          name: groupName,
          active: false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.log("Guruh qo'shishda xatolik:", error)
      return
    }

    setGroups([...groups, data])
    setGroupName("")
    setGroupModalOpen(false)
  }

  const addStudent = async () => {
    if (!studentGroupId) {
      alert("Guruh tanlang")
      return
    }

    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          fullname,
          age: Number(age),
          email,
          active,
          group_id: studentGroupId,
        },
      ])
      .select()
      .single()

    if (error) {
      console.log("O'quvchi qo'shishda xatolik:", error)
      return
    }

    if (selectedGroupId === studentGroupId) {
      setStudents([...students, data])
    }

    setFullname("")
    setAge("")
    setEmail("")
    setActive(false)
    setStudentGroupId(0)
    setStudentModalOpen(false)
  }

  const deleteStudent = async (id: number) => {
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", id)

    if (error) {
      console.log("O'chirishda xatolik:", error)
      return
    }

    setStudents(students.filter((student) => student.id !== id))
  }

  const openStudentModal = () => {
    if (selectedGroupId) {
      setStudentGroupId(selectedGroupId)
    } else {
      setStudentGroupId(0)
    }

    setStudentModalOpen(true)
  }

  const closeStudentModal = () => {
    setStudentModalOpen(false)
    setFullname("")
    setAge("")
    setEmail("")
    setActive(false)
    setStudentGroupId(0)
  }

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedGroup = groups.find((group) => group.id === selectedGroupId)

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-center justify-between gap-4 border-b pb-6">
          <div className="h-16 w-16 rounded-2xl border bg-white"></div>

          <input
            placeholder="search by group name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-96 rounded-xl border px-4 py-3 outline-none"
          />

          <div className="flex gap-4">
            <button
              onClick={() => setGroupModalOpen(true)}
              className="rounded-xl border px-5 py-3 font-semibold"
            >
              add group
            </button>

            <button
              onClick={openStudentModal}
              className="rounded-xl border px-5 py-3 font-semibold"
            >
              add student
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => getStudentsByGroup(group.id)}
              className={`cursor-pointer rounded-3xl border bg-white p-8 shadow-sm ${
                selectedGroupId === group.id
                  ? "border-blue-400"
                  : "border-slate-200"
              }`}
            >
              <h2 className="text-center text-4xl font-bold">
                {group.name}
              </h2>

              <p className="mt-2 text-center text-xl text-slate-500">
                {selectedGroupId === group.id
                  ? `${students.length} students`
                  : "students"}
              </p>

              <div className="mt-6 flex justify-end">
                <div
                  className={`h-8 w-14 rounded-full p-1 ${
                    group.active ? "bg-blue-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white ${
                      group.active ? "ml-6" : ""
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedGroup && (
          <h2 className="mb-4 text-2xl font-bold">
            {selectedGroup.name} o'quvchilari
          </h2>
        )}

        <table className="w-full">
          <thead>
            <tr>
              <th className="border-b p-4 text-left">N°</th>
              <th className="border-b p-4 text-left">Fullname</th>
              <th className="border-b p-4 text-left">Age</th>
              <th className="border-b p-4 text-left">Email</th>
              <th className="border-b p-4 text-left">Active</th>
              <th className="border-b p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td className="p-4">{index + 1}</td>
                <td className="p-4">{student.fullname}</td>
                <td className="p-4">{student.age}</td>
                <td className="p-4">{student.email}</td>
                <td className="p-4">
                  <input type="checkbox" checked={student.active} readOnly />
                </td>
                <td className="p-4">
                  <button
                    onClick={() => deleteStudent(student.id)}
                    className="mr-3 rounded-lg bg-red-500 px-3 py-2 text-white"
                  >
                    Delete
                  </button>

                  <button className="rounded-lg bg-blue-500 px-3 py-2 text-white">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedGroupId && students.length === 0 && (
          <p className="py-10 text-center text-slate-400">
            Bu guruhda hali o'quvchi yo'q
          </p>
        )}
      </div>

      <Rodal
        visible={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        width={420}
        height={240}
        customStyles={{
          borderRadius: "20px",
          padding: "0",
        }}
      >
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold">Add group</h2>

          <input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mb-4 w-full rounded-xl border px-4 py-3 outline-none"
          />

          <div className="flex gap-3">
            <button
              onClick={() => setGroupModalOpen(false)}
              className="flex-1 rounded-xl border py-3"
            >
              Cancel
            </button>

            <button
              onClick={addGroup}
              className="flex-1 rounded-xl bg-black py-3 text-white"
            >
              Save
            </button>
          </div>
        </div>
      </Rodal>

      <Rodal
        visible={studentModalOpen}
        onClose={closeStudentModal}
        width={430}
        height={500}
        customStyles={{
          borderRadius: "20px",
          padding: "0",
        }}
      >
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold">Add student</h2>

          <input
            placeholder="Fullname"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className="mb-3 w-full rounded-xl border px-4 py-3 outline-none"
          />

          <input
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="mb-3 w-full rounded-xl border px-4 py-3 outline-none"
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 w-full rounded-xl border px-4 py-3 outline-none"
          />

          <select
            value={studentGroupId}
            onChange={(e) => setStudentGroupId(Number(e.target.value))}
            className="mb-3 w-full rounded-xl border px-4 py-3 outline-none"
          >
            <option value={0}>Guruh tanlang</option>

            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          <label className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active
          </label>

          <div className="flex gap-3">
            <button
              onClick={closeStudentModal}
              className="flex-1 rounded-xl border py-3"
            >
              Cancel
            </button>

            <button
              onClick={addStudent}
              className="flex-1 rounded-xl bg-black py-3 text-white"
            >
              Save
            </button>
          </div>
        </div>
      </Rodal>
    </main>
  )
}