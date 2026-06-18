"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

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

function groups() {

const [groups, setGroups] = useState<Group[]>([])
const [students, setStudents] = useState<Student[]>([])
const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
const [search, setSearch] = useState("")

useEffect(() => {
  getGroups()
}, [])

const getGroups = async () => {
  const { data, error } = await supabase.from("groups").select("*").order("id", { ascending: true })

  if (error) {
    console.log("Guruhlarni olishda xatolik:", error)
    return
  }

  setGroups(data || [])
}
  return (
    <div>
        <main className="min-h-screen bg-slate-100 p-8">
  <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6">
    <div className="mb-8 flex items-center justify-between gap-4">
      <div className="h-16 w-16 rounded-2xl border bg-white"></div>

      <input
        placeholder="search by group name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-96 rounded-xl border px-4 py-3"
      />

      <div className="flex gap-4">
        <button className="rounded-xl border px-5 py-3">
          add group
        </button>

        <button className="rounded-xl border px-5 py-3">
          add student
        </button>
      </div>
    </div>
  </div>
</main>
    </div>
  )
}

export default groups