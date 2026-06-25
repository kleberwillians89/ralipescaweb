import { Edit3, Plus, RefreshCw, Save, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { canManageTeams } from '../services/permissions';
import {
  createTeam,
  createTeamMember,
  deleteTeam,
  deleteTeamMember,
  getTeamMembers,
  getTeams,
  updateTeam,
  updateTeamMember,
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

type MemberForm = {
  id?: string;
  member_name: string;
  phone: string;
  role: string;
  notes: string;
};

const emptyTeamForm: TeamForm = {
  name: '',
  boat_name: '',
  captain_name: '',
  phone: '',
  city: '',
};

const emptyMemberForm: MemberForm = {
  member_name: '',
  phone: '',
  role: '',
  notes: '',
};

const MAX_MEMBERS = 5;

export function TeamsPage() {
  const { profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [membersByTeam, setMembersByTeam] = useState<Record<string, TeamMember[]>>({});
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamForm, setTeamForm] = useState<TeamForm>(emptyTeamForm);
  const [memberForm, setMemberForm] = useState<MemberForm>(emptyMemberForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedTeam = useMemo(() => teams.find((team) => team.id === selectedTeamId) ?? null, [selectedTeamId, teams]);
  const selectedMembers = selectedTeamId ? membersByTeam[selectedTeamId] ?? [] : [];

  const loadTeams = async () => {
    setError('');
    setLoading(true);
    try {
      const loadedTeams = await getTeams();
      const entries = await Promise.all(loadedTeams.map(async (team) => [team.id, await getTeamMembers(team.id)] as const));
      setTeams(loadedTeams);
      setMembersByTeam(Object.fromEntries(entries));
      if (!selectedTeamId && loadedTeams[0]) {
        setSelectedTeamId(loadedTeams[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar equipes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTeams();
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
    setMemberForm(emptyMemberForm);
  }, [selectedTeam]);

  if (!canManageTeams(profile)) {
    return (
      <div>
        <PageHeader eyebrow="Acesso restrito" title="Equipes" description="Você não tem permissão para gerenciar equipes." />
        <Card>
          <p className="text-sm font-semibold text-graphite/70">Somente usuários admin ou commission podem criar, editar e excluir equipes.</p>
        </Card>
      </div>
    );
  }

  const refreshMembers = async (teamId: string) => {
    const members = await getTeamMembers(teamId);
    setMembersByTeam((current) => ({ ...current, [teamId]: members }));
  };

  const startNewTeam = () => {
    setSelectedTeamId('');
    setTeamForm(emptyTeamForm);
    setMemberForm(emptyMemberForm);
    setSuccess('');
    setError('');
  };

  const handleSaveTeam = async () => {
    setError('');
    setSuccess('');
    if (!teamForm.name.trim()) {
      setError('Informe o nome da equipe.');
      return;
    }

    setSaving(true);
    try {
      if (teamForm.id) {
        const updated = await updateTeam(teamForm.id, {
          name: teamForm.name.trim(),
          boat_name: teamForm.boat_name || null,
          captain_name: teamForm.captain_name || null,
          phone: teamForm.phone || null,
          city: teamForm.city || null,
        });
        setTeams((current) => current.map((team) => (team.id === updated.id ? updated : team)));
        setSuccess('Equipe atualizada com sucesso.');
      } else {
        const created = await createTeam({
          name: teamForm.name.trim(),
          boat_name: teamForm.boat_name || null,
          captain_name: teamForm.captain_name || null,
          phone: teamForm.phone || null,
          city: teamForm.city || null,
        });
        setTeams((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
        setMembersByTeam((current) => ({ ...current, [created.id]: [] }));
        setSelectedTeamId(created.id);
        setSuccess('Equipe criada com sucesso.');
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar a equipe.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta equipe? Essa ação também pode afetar pesagens e integrantes vinculados.')) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await deleteTeam(teamId);
      setTeams((current) => current.filter((team) => team.id !== teamId));
      setMembersByTeam((current) => {
        const next = { ...current };
        delete next[teamId];
        return next;
      });
      if (selectedTeamId === teamId) {
        startNewTeam();
      }
      setSuccess('Equipe excluída.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir a equipe.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMember = async () => {
    setError('');
    setSuccess('');

    if (!selectedTeamId) {
      setError('Selecione uma equipe para gerenciar integrantes.');
      return;
    }

    if (!memberForm.member_name.trim()) {
      setError('Informe o nome do integrante.');
      return;
    }

    if (!memberForm.id && selectedMembers.length >= MAX_MEMBERS) {
      setError('O regulamento permite até 5 integrantes por embarcação.');
      return;
    }

    setSaving(true);
    try {
      if (memberForm.id) {
        await updateTeamMember(memberForm.id, {
          member_name: memberForm.member_name.trim(),
          name: memberForm.member_name.trim(),
          phone: memberForm.phone || null,
          role: memberForm.role || null,
          member_role: memberForm.role || 'angler',
          notes: memberForm.notes || null,
        });
        setSuccess('Integrante atualizado.');
      } else {
        await createTeamMember({
          team_id: selectedTeamId,
          member_name: memberForm.member_name.trim(),
          name: memberForm.member_name.trim(),
          phone: memberForm.phone || null,
          role: memberForm.role || null,
          member_role: memberForm.role || 'angler',
          notes: memberForm.notes || null,
        });
        setSuccess('Integrante adicionado.');
      }

      setMemberForm(emptyMemberForm);
      await refreshMembers(selectedTeamId);
    } catch (memberError) {
      setError(memberError instanceof Error ? memberError.message : 'Não foi possível salvar integrante.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setMemberForm({
      id: member.id,
      member_name: member.member_name || member.name || '',
      phone: member.phone || '',
      role: member.role || member.member_role || '',
      notes: member.notes || '',
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('Remover integrante?')) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      await deleteTeamMember(memberId);
      if (selectedTeamId) {
        await refreshMembers(selectedTeamId);
      }
      setSuccess('Integrante removido.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível remover integrante.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operação"
        title="Equipes"
        description="Cadastre equipes e integrantes manualmente após a compra dos ingressos nas plataformas externas."
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sea px-5 py-3 text-sm font-bold text-white" onClick={startNewTeam} type="button">
          <Plus size={18} /> Nova equipe
        </button>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sand px-5 py-3 text-sm font-bold text-sea" onClick={() => void loadTeams()} type="button">
          <RefreshCw size={18} /> Tentar novamente
        </button>
      </div>

      {error ? <p className="mb-4 rounded-2xl bg-sand/45 px-4 py-3 text-sm font-semibold text-graphite/75">{error}</p> : null}
      {success ? <p className="mb-4 rounded-2xl bg-sand/45 px-4 py-3 text-sm font-semibold text-sea">{success}</p> : null}
      {loading ? <p className="text-sm font-semibold text-graphite/70">Carregando equipes...</p> : null}

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!loading && teams.length === 0 ? (
          <Card>
            <p className="text-sm font-semibold text-graphite/70">Nenhuma equipe cadastrada.</p>
          </Card>
        ) : null}

        {teams.map((team) => {
          const memberCount = membersByTeam[team.id]?.length ?? 0;
          return (
            <Card className={team.id === selectedTeamId ? 'border-gold/80 shadow-premium' : ''} key={team.id}>
              <h2 className="truncate text-xl font-bold text-sea">{team.name}</h2>
              <div className="mt-3 space-y-1 text-sm text-graphite/70">
                <p>Embarcação: {team.boat_name || 'Não informada'}</p>
                <p>Capitão: {team.captain_name || 'Não informado'}</p>
                <p>Telefone: {team.phone || 'Não informado'}</p>
                <p>Cidade: {team.city || 'Não informada'}</p>
                <p>Integrantes: {memberCount}/{MAX_MEMBERS}</p>
              </div>
              <div className="mt-5 grid gap-2">
                <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sea px-4 py-2 text-sm font-bold text-white" onClick={() => setSelectedTeamId(team.id)} type="button">
                  <Edit3 size={17} /> Editar
                </button>
                <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-bold text-sea" onClick={() => setSelectedTeamId(team.id)} type="button">
                  <Users size={17} /> Gerenciar integrantes
                </button>
                <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-bold text-sea" onClick={() => void handleDeleteTeam(team.id)} type="button">
                  <Trash2 size={17} /> Excluir
                </button>
              </div>
            </Card>
          );
        })}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <h2 className="mb-4 text-xl font-bold text-sea">{teamForm.id ? 'Editar equipe' : 'Criar equipe'}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['name', 'Nome da equipe *'],
              ['boat_name', 'Nome da embarcação'],
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
          <button className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sea px-5 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={saving} onClick={handleSaveTeam} type="button">
            <Save size={18} /> {saving ? 'Salvando...' : 'Salvar equipe'}
          </button>
        </Card>

        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-sea">
            <Users size={21} /> Integrantes
          </h2>
          <p className="mb-4 text-sm text-graphite/70">
            {selectedTeam ? `${selectedTeam.name} · ${selectedMembers.length}/${MAX_MEMBERS}` : 'Selecione uma equipe para cadastrar integrantes.'}
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['member_name', 'Nome do integrante *'],
              ['phone', 'Telefone'],
              ['role', 'Função/cargo'],
              ['notes', 'Observação'],
            ].map(([field, label]) => (
              <label className="space-y-2" key={field}>
                <span className="text-sm font-semibold text-graphite/70">{label}</span>
                <input
                  className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3 outline-none focus:border-gold"
                  onChange={(event) => setMemberForm((current) => ({ ...current, [field]: event.target.value }))}
                  value={memberForm[field as keyof MemberForm] ?? ''}
                />
              </label>
            ))}
          </div>
          <button className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sea px-5 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={saving || !selectedTeamId} onClick={handleSaveMember} type="button">
            <Plus size={18} /> {memberForm.id ? 'Salvar integrante' : 'Adicionar integrante'}
          </button>

          <div className="mt-5 space-y-2">
            {selectedTeam && selectedMembers.length === 0 ? <p className="text-sm text-graphite/70">Nenhum integrante cadastrado.</p> : null}
            {selectedMembers.map((member) => (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-sand/60 p-3" key={member.id}>
                <div className="min-w-0">
                  <p className="truncate font-bold text-sea">{member.member_name || member.name || 'Sem nome'}</p>
                  <p className="truncate text-sm text-graphite/65">{member.role || member.member_role || 'sem função'} · {member.phone || 'sem telefone'}</p>
                  {member.notes ? <p className="text-sm text-graphite/60">{member.notes}</p> : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button className="grid h-10 w-10 place-items-center rounded-full border border-sand text-sea" onClick={() => handleEditMember(member)} type="button">
                    <Edit3 size={17} />
                  </button>
                  <button className="grid h-10 w-10 place-items-center rounded-full border border-sand text-sea" onClick={() => void handleDeleteMember(member.id)} type="button">
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
