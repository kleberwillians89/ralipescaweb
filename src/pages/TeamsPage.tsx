import { Plus, Save, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import {
  createTeam,
  createTeamMember,
  deleteTeam,
  deleteTeamMember,
  getTeamMembers,
  getTeams,
  updateTeam,
} from '../services/teamService';
import type { Team, TeamMember } from '../types/database';

type TeamForm = {
  id?: string;
  name: string;
  boat_name: string;
  captain_name: string;
  phone: string;
  city: string;
};

const emptyTeamForm: TeamForm = {
  name: '',
  boat_name: '',
  captain_name: '',
  phone: '',
  city: '',
};

const emptyMemberForm = {
  name: '',
  phone: '',
  role: '',
  notes: '',
};

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamForm, setTeamForm] = useState<TeamForm>(emptyTeamForm);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const selectedTeam = useMemo(() => teams.find((team) => team.id === selectedTeamId) ?? null, [selectedTeamId, teams]);

  const loadTeams = async () => {
    const loadedTeams = await getTeams();
    setTeams(loadedTeams);
    const nextTeamId = selectedTeamId || loadedTeams[0]?.id || '';
    setSelectedTeamId(nextTeamId);
    if (nextTeamId) {
      setMembers(await getTeamMembers(nextTeamId));
    } else {
      setMembers([]);
    }
  };

  useEffect(() => {
    loadTeams()
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Erro ao carregar equipes.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTeam) {
      setTeamForm(emptyTeamForm);
      return;
    }

    setTeamForm({
      id: selectedTeam.id,
      name: selectedTeam.name,
      boat_name: selectedTeam.boat_name ?? '',
      captain_name: selectedTeam.captain_name ?? '',
      phone: selectedTeam.phone ?? '',
      city: selectedTeam.city ?? '',
    });
  }, [selectedTeam]);

  const handleSelectTeam = async (teamId: string) => {
    setSelectedTeamId(teamId);
    setMembers(teamId ? await getTeamMembers(teamId) : []);
  };

  const handleSaveTeam = async () => {
    setFeedback('');
    if (!teamForm.name.trim()) {
      setFeedback('Informe o nome da equipe.');
      return;
    }

    setSaving(true);
    try {
      if (teamForm.id) {
        await updateTeam(teamForm.id, {
          name: teamForm.name,
          boat_name: teamForm.boat_name || null,
          captain_name: teamForm.captain_name || null,
          phone: teamForm.phone || null,
          city: teamForm.city || null,
        });
        setFeedback('Equipe atualizada.');
      } else {
        const created = await createTeam({
          name: teamForm.name,
          boat_name: teamForm.boat_name || null,
          captain_name: teamForm.captain_name || null,
          phone: teamForm.phone || null,
          city: teamForm.city || null,
        });
        setSelectedTeamId(created.id);
        setFeedback('Equipe criada.');
      }
      await loadTeams();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível salvar a equipe.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamForm.id || !window.confirm('Excluir esta equipe e seus integrantes?')) {
      return;
    }

    setSaving(true);
    try {
      await deleteTeam(teamForm.id);
      setSelectedTeamId('');
      setTeamForm(emptyTeamForm);
      setMembers([]);
      await loadTeams();
      setFeedback('Equipe excluída.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível excluir a equipe.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async () => {
    setFeedback('');
    if (!selectedTeamId || !memberForm.name.trim()) {
      setFeedback('Selecione uma equipe e informe o nome do integrante.');
      return;
    }

    try {
      await createTeamMember({
        team_id: selectedTeamId,
        name: memberForm.name,
        phone: memberForm.phone || null,
        role: memberForm.role || null,
        member_role: memberForm.role || 'angler',
        notes: memberForm.notes || null,
      });
      setMemberForm(emptyMemberForm);
      setMembers(await getTeamMembers(selectedTeamId));
      setFeedback('Integrante adicionado.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível adicionar integrante.');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('Remover integrante?')) {
      return;
    }

    await deleteTeamMember(memberId);
    setMembers(selectedTeamId ? await getTeamMembers(selectedTeamId) : []);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operação"
        title="Equipes"
        description="Cadastre equipes e integrantes manualmente após a compra dos ingressos nas plataformas externas."
      />

      {feedback ? <p className="mb-4 rounded-2xl bg-sand/45 px-4 py-3 text-sm font-semibold text-graphite/75">{feedback}</p> : null}
      {loading ? <p className="text-sm font-semibold text-graphite/70">Carregando equipes...</p> : null}

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-sea">Lista</h2>
            <button className="grid h-11 w-11 place-items-center rounded-full bg-sea text-white" onClick={() => setTeamForm(emptyTeamForm)} type="button">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {teams.length === 0 && !loading ? <p className="text-sm text-graphite/70">Nenhuma equipe cadastrada.</p> : null}
            {teams.map((team) => (
              <button
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${team.id === selectedTeamId ? 'border-gold bg-sand/35' : 'border-sand/60 bg-white'}`}
                key={team.id}
                onClick={() => void handleSelectTeam(team.id)}
                type="button"
              >
                <span className="block truncate font-bold text-sea">{team.name}</span>
                <span className="block truncate text-sm text-graphite/65">{team.boat_name || 'Sem embarcação'}</span>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <h2 className="mb-4 text-xl font-bold text-sea">{teamForm.id ? 'Editar equipe' : 'Criar equipe'}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['name', 'Nome da equipe'],
                ['boat_name', 'Embarcação'],
                ['captain_name', 'Capitão'],
                ['phone', 'Telefone'],
                ['city', 'Cidade'],
              ].map(([field, label]) => (
                <label className="space-y-2" key={field}>
                  <span className="text-sm font-semibold text-graphite/70">{label}</span>
                  <input
                    className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3 outline-none focus:border-gold"
                    onChange={(event) => setTeamForm((current) => ({ ...current, [field]: event.target.value }))}
                    value={teamForm[field as keyof TeamForm] ?? ''}
                  />
                </label>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sea px-5 py-3 text-sm font-bold text-white" disabled={saving} onClick={handleSaveTeam} type="button">
                <Save size={18} /> Salvar equipe
              </button>
              {teamForm.id ? (
                <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sand px-5 py-3 text-sm font-bold text-sea" disabled={saving} onClick={handleDeleteTeam} type="button">
                  <Trash2 size={18} /> Excluir
                </button>
              ) : null}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-sea">
              <Users size={21} /> Integrantes
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['name', 'Nome do integrante'],
                ['phone', 'Telefone'],
                ['role', 'Função/cargo'],
                ['notes', 'Observação'],
              ].map(([field, label]) => (
                <label className="space-y-2" key={field}>
                  <span className="text-sm font-semibold text-graphite/70">{label}</span>
                  <input
                    className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3 outline-none focus:border-gold"
                    onChange={(event) => setMemberForm((current) => ({ ...current, [field]: event.target.value }))}
                    value={memberForm[field as keyof typeof emptyMemberForm]}
                  />
                </label>
              ))}
            </div>
            <button className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sea px-5 py-3 text-sm font-bold text-white" onClick={handleAddMember} type="button">
              <Plus size={18} /> Adicionar integrante
            </button>

            <div className="mt-5 space-y-2">
              {members.length === 0 ? <p className="text-sm text-graphite/70">Nenhum integrante cadastrado.</p> : null}
              {members.map((member) => (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-sand/60 p-3" key={member.id}>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-sea">{member.name || 'Sem nome'}</p>
                    <p className="truncate text-sm text-graphite/65">{member.role || member.member_role} · {member.phone || 'sem telefone'}</p>
                    {member.notes ? <p className="text-sm text-graphite/60">{member.notes}</p> : null}
                  </div>
                  <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-sand text-sea" onClick={() => void handleDeleteMember(member.id)} type="button">
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
