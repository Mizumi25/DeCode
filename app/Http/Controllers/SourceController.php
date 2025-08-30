<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Frame;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SourceController extends Controller
{
    public function show(Project $project, Frame $frame): Response
    {
        if ($frame->project_id !== $project->id || $project->user_id !== auth()->id()) {
            abort(404);
        }
        
        return Inertia::render('SourcePage', [
            'project' => $project,
            'frame' => $frame,
            'mode' => 'source'
        ]);
    }
}
