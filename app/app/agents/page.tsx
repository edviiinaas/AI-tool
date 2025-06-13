"use client"
import { useEffect, useState } from "react"
import { useChatStore } from "@/lib/chat-store"
import type { Metadata } from "next"
import AgentSettingsPageClient from "./AgentSettingsPageClient"
import { BreadcrumbNav } from "@/components/app/breadcrumb-nav"
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { supabase } from "@/lib/supabase"

export default function AgentManagementPage() {
  const { agents, loadAgents, createAgent, updateAgent, deleteAgent } = useChatStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newAgent, setNewAgent] = useState({ name: "", emoji: "", description: "", system_prompt: "" })
  const [editId, setEditId] = useState<string | null>(null)
  const [editAgent, setEditAgent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    loadAgents().finally(() => setLoading(false))
  }, [])

  const handleAdd = async () => {
    if (!newAgent.name || !newAgent.emoji || !newAgent.system_prompt) return
    try {
      await createAgent(newAgent)
      toast.success('Agent added')
    } catch {
      toast.error('Failed to add agent')
    }
    setShowAdd(false)
    setNewAgent({ name: "", emoji: "", description: "", system_prompt: "" })
  }

  const handleEdit = async () => {
    if (!editAgent || !editId) return
    try {
      await updateAgent(editId, editAgent)
      toast.success('Agent updated')
    } catch {
      toast.error('Failed to update agent')
    }
    setEditId(null)
    setEditAgent(null)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      setDeletingId(id)
      try {
        await deleteAgent(id)
        toast.success('Agent deleted')
      } catch {
        toast.error('Failed to delete agent')
      } finally {
        setDeletingId(null)
      }
    }
  }

  return (
    <>
      <BreadcrumbNav />
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6">Agent Management</h1>
        <button className="mb-4 btn btn-primary" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? "Cancel" : "+ Add Agent"}
        </button>
        {showAdd && (
          <div className="mb-6 p-4 border rounded flex flex-col gap-2 bg-gray-50">
            <input className="input" placeholder="Name" value={newAgent.name} onChange={e => setNewAgent(a => ({ ...a, name: e.target.value }))} />
            <input className="input" placeholder="Emoji" value={newAgent.emoji} onChange={e => setNewAgent(a => ({ ...a, emoji: e.target.value }))} />
            <input className="input" placeholder="Description" value={newAgent.description} onChange={e => setNewAgent(a => ({ ...a, description: e.target.value }))} />
            <textarea className="input" placeholder="System Prompt" value={newAgent.system_prompt} onChange={e => setNewAgent(a => ({ ...a, system_prompt: e.target.value }))} />
            <button className="btn btn-success mt-2" onClick={handleAdd}>Add</button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border rounded bg-white text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Emoji</th>
                <th className="p-2">Name</th>
                <th className="p-2">Description</th>
                <th className="p-2">System Prompt</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}><Skeleton className="h-8 w-full my-2" /></td>
                  </tr>
                ))
              ) : agents.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-gray-500 text-center">No agents yet</td></tr>
              ) : (
                agents.map(agent => (
                  <tr key={agent.id} className="border-t">
                    <td className="p-2 text-2xl">{agent.emoji}</td>
                    <td className="p-2">{editId === agent.id ? <input value={editAgent?.name || ""} onChange={e => setEditAgent((a: any) => ({ ...a, name: e.target.value }))} /> : agent.name}</td>
                    <td className="p-2">{editId === agent.id ? <input value={editAgent?.description || ""} onChange={e => setEditAgent((a: any) => ({ ...a, description: e.target.value }))} /> : agent.description}</td>
                    <td className="p-2 max-w-xs truncate">{editId === agent.id ? <textarea value={editAgent?.system_prompt || ""} onChange={e => setEditAgent((a: any) => ({ ...a, system_prompt: e.target.value }))} /> : <span title={agent.system_prompt}>{agent.system_prompt}</span>}</td>
                    <td className="p-2">{agent.is_active ? "Active" : "Inactive"}</td>
                    <td className="p-2 flex gap-2 flex-wrap">
                      {editId === agent.id ? (
                        <>
                          <button className="btn btn-success" onClick={handleEdit}>Save</button>
                          <button className="btn btn-secondary" onClick={() => { setEditId(null); setEditAgent(null); }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-sm" onClick={() => { setEditId(agent.id); setEditAgent(agent); }}>Edit</button>
                          <button className="btn btn-sm btn-danger" disabled={deletingId === agent.id} onClick={() => handleDelete(agent.id)}>Delete</button>
                          <button className="btn btn-sm" onClick={() => updateAgent(agent.id, { is_active: !agent.is_active })}>{agent.is_active ? "Deactivate" : "Activate"}</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
