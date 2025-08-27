<?php
// app/Models/Frame.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Frame extends Model {
    use HasFactory;

    protected $fillable = [
      'uuid', 
      'project_id', 
      'name', 
      'type', 
      'canvas_data', 
      'settings',
      'thumbnail_path'
      ];
      
    protected $casts = ['canvas_data'=>'array','settings'=>'array'];

    // This is new
    public static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) Str::uuid();
        });
    }

    // This is new, it tells Laravel to use the 'uuid' column for route model binding
    public function getRouteKeyName()
    {
        return 'uuid';
    }

    public function project() {
        return $this->belongsTo(Project::class);
    }
}