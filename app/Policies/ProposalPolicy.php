<?php

namespace App\Policies;

use App\Models\Proposal;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProposalPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'kadis']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Proposal $proposal): bool
    {
        // 1. Izinkan jika user adalah admin, kadis, atau pemilik proposal
        if ($user->hasRole(['admin', 'kadis']) || $user->id === $proposal->pengusul_id) {
            return true;
        }

        // 2. PERBAIKAN: Izinkan pegawai jika mereka adalah anggota tim dari kegiatan terkait
        if ($user->hasRole('pegawai')) {
            // Memuat relasi kegiatan dari proposal
            $kegiatan = $proposal->kegiatan;
            
            // Cek jika kegiatan ada dan user adalah anggota timnya
            if ($kegiatan && $kegiatan->tim && $kegiatan->tim->pegawais->contains($user)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('pengusul');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Proposal $proposal = null): bool
    {
        if (is_null($proposal)) {
            return $user->hasRole(['kadis', 'pengusul', 'admin']);
        }
        return $user->hasRole('kadis') || $user->id === $proposal->pengusul_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Proposal $proposal): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Proposal $proposal): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Proposal $proposal): bool
    {
        return $user->hasRole('admin');
    }
    public function viewApproved(User $user): bool
    {
        return $user->hasRole('kabid') || $user->hasRole('kadis');
    }
}
