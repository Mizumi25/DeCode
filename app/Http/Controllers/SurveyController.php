<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Project;
use App\Models\Frame;
use App\Models\Workspace;
use Inertia\Inertia;

class SurveyController extends Controller
{
    /**
     * Show the survey page
     */
    public function index()
    {
        return Inertia::render('Survey');
    }

    /**
     * Handle survey submission
     * - Updates user's name
     * - Saves survey data
     * - Auto-creates workspace, project, and frame
     * - Redirects to ForgePage
     */
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'survey_data' => 'required|array',
            'survey_data.useCase' => 'required|string',
            'survey_data.role' => 'required|string',
            'survey_data.projectType' => 'required|string',
            'survey_data.designExperience' => 'required|string',
        ]);

        $user = Auth::user();

        // 🔥 Update user's name
        $fullName = $validated['first_name'] . ' ' . $validated['last_name'];
        $user->update([
            'name' => $fullName,
            'survey_data' => $validated['survey_data'],
            'survey_completed' => true,
        ]);

        // 🔥 Get or create default workspace
        $workspace = $user->workspaces()->first();
        if (!$workspace) {
            $workspace = Workspace::create([
                'name' => $user->name . "'s Workspace",
                'owner_id' => $user->id,
            ]);
            
            // Add user to workspace
            $workspace->users()->attach($user->id, [
                'role' => 'owner',
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 🔥 Determine project title based on project type
        $projectTitles = [
            'website' => 'My Website',
            'landing-page' => 'Landing Page',
            'web-app' => 'Web Application',
            'mobile-app' => 'Mobile App Design',
            'dashboard' => 'Dashboard',
            'portfolio' => 'My Portfolio',
            'ecommerce' => 'E-commerce Store',
            'prototype' => 'Design Prototype',
        ];

        $projectType = $validated['survey_data']['projectType'];
        $projectTitle = $projectTitles[$projectType] ?? 'My First Project';

        // 🔥 Auto-create project
        $project = Project::create([
            'name' => $projectTitle,
            'description' => 'Created from onboarding survey',
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'style_framework' => 'css', // Default to CSS
            'is_published' => false,
        ]);

        // 🔥 Determine frame device based on project type
        $frameDevice = match($projectType) {
            'mobile-app' => 'mobile',
            'dashboard', 'web-app' => 'desktop',
            default => 'desktop', // Default for website, landing-page, etc.
        };

        // 🔥 Auto-create frame
        $frame = Frame::create([
            'name' => 'Home',
            'project_id' => $project->id,
            'workspace_id' => $workspace->id,
            'canvas_data' => [
                'device' => $frameDevice,
                'backgroundColor' => '#ffffff',
                'width' => $frameDevice === 'mobile' ? 375 : ($frameDevice === 'tablet' ? 768 : 1440),
                'height' => $frameDevice === 'mobile' ? 667 : ($frameDevice === 'tablet' ? 1024 : 900),
            ],
            'settings' => [
                'responsive_mode' => $frameDevice,
            ],
            'sort_order' => 0,
        ]);

        // 🔥 Redirect to ForgePage with the auto-created frame
        return redirect()->route('frame.forge', [
            'project' => $project->uuid,
            'frame' => $frame->uuid,
        ]);
    }
}
