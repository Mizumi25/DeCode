<?php

namespace Tests\Feature;

use App\Models\Frame;
use App\Models\Project;
use App\Models\ProjectComponent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ProjectComponentsBulkUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_bulk_update_allows_components_without_name_and_defaults_name_server_side(): void
    {
        $user = User::factory()->create([
            'name' => 'Tester',
        ]);

        $project = Project::create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $user->id,
            'name' => 'Test Project',
        ]);

        $frame = Frame::create([
            'uuid' => (string) Str::uuid(),
            'project_id' => $project->id,
            'name' => 'Test Frame',
        ]);

        $payload = [
            'project_id' => $project->uuid,
            'frame_id' => $frame->uuid,
            'components' => [
                [
                    'id' => 'parsed_1',
                    'type' => 'Container',
                    // intentionally no `name`
                    'props' => [],
                    'style' => ['className' => 'min-h-screen'],
                    'children' => [
                        [
                            'id' => 'parsed_2',
                            'type' => 'Container',
                            // intentionally no `name`
                            'parentId' => 'parsed_1',
                            'props' => [],
                            'style' => [],
                        ],
                    ],
                ],
            ],
            'silent' => true,
        ];

        $response = $this
            ->actingAs($user)
            ->postJson('/api/project-components/bulk-update', $payload);

        $response
            ->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertSame(2, ProjectComponent::query()->count());

        $root = ProjectComponent::query()->where('component_instance_id', 'parsed_1')->firstOrFail();
        $child = ProjectComponent::query()->where('component_instance_id', 'parsed_2')->firstOrFail();

        // Server should have defaulted name to something meaningful
        $this->assertSame('Container', $root->name);
        $this->assertSame('Container', $child->name);

        $this->assertSame($root->id, $child->parent_id);
    }
}
