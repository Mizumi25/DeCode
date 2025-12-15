<?php
// database/seeders/IconSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Icon;

class IconSeeder extends Seeder
{
    public function run(): void
    {
        $icons = [
            // ============================================
            // LUCIDE ICONS
            // ============================================
            
            // Navigation
            ['name' => 'Home', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'H', 'description' => 'Home icon', 'library_name' => 'Home', 'is_system' => true, 'tags' => ['navigation', 'house', 'main']],
            ['name' => 'Menu', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'M', 'description' => 'Menu hamburger icon', 'library_name' => 'Menu', 'is_system' => true, 'tags' => ['menu', 'hamburger', 'navigation']],
            ['name' => 'ArrowLeft', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'A', 'description' => 'Left arrow', 'library_name' => 'ArrowLeft', 'is_system' => true, 'tags' => ['arrow', 'back', 'previous']],
            ['name' => 'ArrowRight', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'A', 'description' => 'Right arrow', 'library_name' => 'ArrowRight', 'is_system' => true, 'tags' => ['arrow', 'forward', 'next']],
            ['name' => 'ChevronUp', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'C', 'description' => 'Chevron up', 'library_name' => 'ChevronUp', 'is_system' => true, 'tags' => ['chevron', 'up', 'arrow']],
            ['name' => 'ChevronDown', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'C', 'description' => 'Chevron down', 'library_name' => 'ChevronDown', 'is_system' => true, 'tags' => ['chevron', 'down', 'arrow']],
            
            // Actions
            ['name' => 'Check', 'type' => 'lucide', 'category' => 'actions', 'alphabet_group' => 'C', 'description' => 'Check mark', 'library_name' => 'Check', 'is_system' => true, 'tags' => ['check', 'confirm', 'success']],
            ['name' => 'X', 'type' => 'lucide', 'category' => 'actions', 'alphabet_group' => 'X', 'description' => 'Close icon', 'library_name' => 'X', 'is_system' => true, 'tags' => ['close', 'cancel', 'delete']],
            ['name' => 'Plus', 'type' => 'lucide', 'category' => 'actions', 'alphabet_group' => 'P', 'description' => 'Plus icon', 'library_name' => 'Plus', 'is_system' => true, 'tags' => ['add', 'create', 'new']],
            ['name' => 'Minus', 'type' => 'lucide', 'category' => 'actions', 'alphabet_group' => 'M', 'description' => 'Minus icon', 'library_name' => 'Minus', 'is_system' => true, 'tags' => ['subtract', 'remove', 'minimize']],
            ['name' => 'Edit', 'type' => 'lucide', 'category' => 'actions', 'alphabet_group' => 'E', 'description' => 'Edit icon', 'library_name' => 'Edit', 'is_system' => true, 'tags' => ['edit', 'pencil', 'modify']],
            ['name' => 'Trash2', 'type' => 'lucide', 'category' => 'actions', 'alphabet_group' => 'T', 'description' => 'Trash icon', 'library_name' => 'Trash2', 'is_system' => true, 'tags' => ['delete', 'remove', 'trash']],
            ['name' => 'Copy', 'type' => 'lucide', 'category' => 'actions', 'alphabet_group' => 'C', 'description' => 'Copy icon', 'library_name' => 'Copy', 'is_system' => true, 'tags' => ['copy', 'duplicate']],
            ['name' => 'Download', 'type' => 'lucide', 'category' => 'actions', 'alphabet_group' => 'D', 'description' => 'Download icon', 'library_name' => 'Download', 'is_system' => true, 'tags' => ['download', 'save']],
            ['name' => 'Upload', 'type' => 'lucide', 'category' => 'actions', 'alphabet_group' => 'U', 'description' => 'Upload icon', 'library_name' => 'Upload', 'is_system' => true, 'tags' => ['upload', 'import']],
            
            // People
            ['name' => 'User', 'type' => 'lucide', 'category' => 'people', 'alphabet_group' => 'U', 'description' => 'User icon', 'library_name' => 'User', 'is_system' => true, 'tags' => ['user', 'person', 'profile']],
            ['name' => 'Users', 'type' => 'lucide', 'category' => 'people', 'alphabet_group' => 'U', 'description' => 'Multiple users', 'library_name' => 'Users', 'is_system' => true, 'tags' => ['users', 'people', 'group']],
            ['name' => 'UserCheck', 'type' => 'lucide', 'category' => 'people', 'alphabet_group' => 'U', 'description' => 'User verified', 'library_name' => 'UserCheck', 'is_system' => true, 'tags' => ['user', 'verified', 'check']],
            
            // Communication
            ['name' => 'Mail', 'type' => 'lucide', 'category' => 'communication', 'alphabet_group' => 'M', 'description' => 'Email icon', 'library_name' => 'Mail', 'is_system' => true, 'tags' => ['email', 'mail', 'message']],
            ['name' => 'Phone', 'type' => 'lucide', 'category' => 'communication', 'alphabet_group' => 'P', 'description' => 'Phone icon', 'library_name' => 'Phone', 'is_system' => true, 'tags' => ['phone', 'call', 'contact']],
            ['name' => 'MessageCircle', 'type' => 'lucide', 'category' => 'communication', 'alphabet_group' => 'M', 'description' => 'Message icon', 'library_name' => 'MessageCircle', 'is_system' => true, 'tags' => ['message', 'chat', 'comment']],
            ['name' => 'Bell', 'type' => 'lucide', 'category' => 'communication', 'alphabet_group' => 'B', 'description' => 'Notification bell', 'library_name' => 'Bell', 'is_system' => true, 'tags' => ['notification', 'bell', 'alert']],
            
            // Media
            ['name' => 'Image', 'type' => 'lucide', 'category' => 'media', 'alphabet_group' => 'I', 'description' => 'Image icon', 'library_name' => 'Image', 'is_system' => true, 'tags' => ['image', 'photo', 'picture']],
            ['name' => 'Camera', 'type' => 'lucide', 'category' => 'media', 'alphabet_group' => 'C', 'description' => 'Camera icon', 'library_name' => 'Camera', 'is_system' => true, 'tags' => ['camera', 'photo']],
            ['name' => 'Video', 'type' => 'lucide', 'category' => 'media', 'alphabet_group' => 'V', 'description' => 'Video icon', 'library_name' => 'Video', 'is_system' => true, 'tags' => ['video', 'film']],
            ['name' => 'Play', 'type' => 'lucide', 'category' => 'media', 'alphabet_group' => 'P', 'description' => 'Play button', 'library_name' => 'Play', 'is_system' => true, 'tags' => ['play', 'start', 'media']],
            ['name' => 'Pause', 'type' => 'lucide', 'category' => 'media', 'alphabet_group' => 'P', 'description' => 'Pause button', 'library_name' => 'Pause', 'is_system' => true, 'tags' => ['pause', 'stop', 'media']],
            ['name' => 'Volume2', 'type' => 'lucide', 'category' => 'media', 'alphabet_group' => 'V', 'description' => 'Volume on', 'library_name' => 'Volume2', 'is_system' => true, 'tags' => ['volume', 'sound', 'audio']],
            ['name' => 'VolumeX', 'type' => 'lucide', 'category' => 'media', 'alphabet_group' => 'V', 'description' => 'Volume muted', 'library_name' => 'VolumeX', 'is_system' => true, 'tags' => ['mute', 'sound', 'audio']],
            
            // Weather
            ['name' => 'Sun', 'type' => 'lucide', 'category' => 'weather', 'alphabet_group' => 'S', 'description' => 'Sun icon', 'library_name' => 'Sun', 'is_system' => true, 'tags' => ['sun', 'weather', 'light']],
            ['name' => 'Moon', 'type' => 'lucide', 'category' => 'weather', 'alphabet_group' => 'M', 'description' => 'Moon icon', 'library_name' => 'Moon', 'is_system' => true, 'tags' => ['moon', 'night', 'dark']],
            ['name' => 'Cloud', 'type' => 'lucide', 'category' => 'weather', 'alphabet_group' => 'C', 'description' => 'Cloud icon', 'library_name' => 'Cloud', 'is_system' => true, 'tags' => ['cloud', 'weather']],
            ['name' => 'CloudRain', 'type' => 'lucide', 'category' => 'weather', 'alphabet_group' => 'C', 'description' => 'Rain cloud', 'library_name' => 'CloudRain', 'is_system' => true, 'tags' => ['rain', 'weather', 'cloud']],
            ['name' => 'Zap', 'type' => 'lucide', 'category' => 'weather', 'alphabet_group' => 'Z', 'description' => 'Lightning bolt', 'library_name' => 'Zap', 'is_system' => true, 'tags' => ['lightning', 'bolt', 'power']],
            ['name' => 'Snowflake', 'type' => 'lucide', 'category' => 'weather', 'alphabet_group' => 'S', 'description' => 'Snowflake icon', 'library_name' => 'Snowflake', 'is_system' => true, 'tags' => ['snow', 'winter', 'cold']],
            
            // Emotions
            ['name' => 'Heart', 'type' => 'lucide', 'category' => 'emotions', 'alphabet_group' => 'H', 'description' => 'Heart icon', 'library_name' => 'Heart', 'is_system' => true, 'tags' => ['heart', 'love', 'like']],
            ['name' => 'Star', 'type' => 'lucide', 'category' => 'emotions', 'alphabet_group' => 'S', 'description' => 'Star icon', 'library_name' => 'Star', 'is_system' => true, 'tags' => ['star', 'favorite', 'rating']],
            ['name' => 'ThumbsUp', 'type' => 'lucide', 'category' => 'emotions', 'alphabet_group' => 'T', 'description' => 'Thumbs up', 'library_name' => 'ThumbsUp', 'is_system' => true, 'tags' => ['like', 'approve', 'thumbs']],
            ['name' => 'ThumbsDown', 'type' => 'lucide', 'category' => 'emotions', 'alphabet_group' => 'T', 'description' => 'Thumbs down', 'library_name' => 'ThumbsDown', 'is_system' => true, 'tags' => ['dislike', 'disapprove', 'thumbs']],
            
            // System
            ['name' => 'Settings', 'type' => 'lucide', 'category' => 'system', 'alphabet_group' => 'S', 'description' => 'Settings gear', 'library_name' => 'Settings', 'is_system' => true, 'tags' => ['settings', 'gear', 'config']],
            ['name' => 'Search', 'type' => 'lucide', 'category' => 'system', 'alphabet_group' => 'S', 'description' => 'Search icon', 'library_name' => 'Search', 'is_system' => true, 'tags' => ['search', 'find', 'magnify']],
            ['name' => 'Filter', 'type' => 'lucide', 'category' => 'system', 'alphabet_group' => 'F', 'description' => 'Filter icon', 'library_name' => 'Filter', 'is_system' => true, 'tags' => ['filter', 'sort']],
            ['name' => 'MoreVertical', 'type' => 'lucide', 'category' => 'system', 'alphabet_group' => 'M', 'description' => 'More options vertical', 'library_name' => 'MoreVertical', 'is_system' => true, 'tags' => ['more', 'options', 'menu']],
            
            // Security
            ['name' => 'Lock', 'type' => 'lucide', 'category' => 'security', 'alphabet_group' => 'L', 'description' => 'Lock icon', 'library_name' => 'Lock', 'is_system' => true, 'tags' => ['lock', 'secure', 'private']],
            ['name' => 'Unlock', 'type' => 'lucide', 'category' => 'security', 'alphabet_group' => 'U', 'description' => 'Unlock icon', 'library_name' => 'Unlock', 'is_system' => true, 'tags' => ['unlock', 'open', 'public']],
            ['name' => 'Shield', 'type' => 'lucide', 'category' => 'security', 'alphabet_group' => 'S', 'description' => 'Shield icon', 'library_name' => 'Shield', 'is_system' => true, 'tags' => ['shield', 'security', 'protect']],
            ['name' => 'Eye', 'type' => 'lucide', 'category' => 'security', 'alphabet_group' => 'E', 'description' => 'Eye visible', 'library_name' => 'Eye', 'is_system' => true, 'tags' => ['eye', 'view', 'visible']],
            ['name' => 'EyeOff', 'type' => 'lucide', 'category' => 'security', 'alphabet_group' => 'E', 'description' => 'Eye hidden', 'library_name' => 'EyeOff', 'is_system' => true, 'tags' => ['eye', 'hide', 'invisible']],
            
            // ============================================
            // HEROICONS
            // ============================================
            
            // Navigation
            ['name' => 'HomeIcon', 'type' => 'heroicons', 'category' => 'navigation', 'alphabet_group' => 'H', 'description' => 'Home icon', 'library_name' => 'HomeIcon', 'is_system' => true, 'tags' => ['navigation', 'house', 'main']],
            ['name' => 'Bars3Icon', 'type' => 'heroicons', 'category' => 'navigation', 'alphabet_group' => 'B', 'description' => 'Menu hamburger', 'library_name' => 'Bars3Icon', 'is_system' => true, 'tags' => ['menu', 'hamburger', 'navigation']],
            ['name' => 'ChevronLeftIcon', 'type' => 'heroicons', 'category' => 'navigation', 'alphabet_group' => 'C', 'description' => 'Chevron left', 'library_name' => 'ChevronLeftIcon', 'is_system' => true, 'tags' => ['chevron', 'left', 'back']],
            ['name' => 'ChevronRightIcon', 'type' => 'heroicons', 'category' => 'navigation', 'alphabet_group' => 'C', 'description' => 'Chevron right', 'library_name' => 'ChevronRightIcon', 'is_system' => true, 'tags' => ['chevron', 'right', 'forward']],
            
            // Actions
            ['name' => 'CheckIcon', 'type' => 'heroicons', 'category' => 'actions', 'alphabet_group' => 'C', 'description' => 'Check mark', 'library_name' => 'CheckIcon', 'is_system' => true, 'tags' => ['check', 'confirm', 'success']],
            ['name' => 'XMarkIcon', 'type' => 'heroicons', 'category' => 'actions', 'alphabet_group' => 'X', 'description' => 'Close icon', 'library_name' => 'XMarkIcon', 'is_system' => true, 'tags' => ['close', 'cancel', 'delete']],
            ['name' => 'PlusIcon', 'type' => 'heroicons', 'category' => 'actions', 'alphabet_group' => 'P', 'description' => 'Plus icon', 'library_name' => 'PlusIcon', 'is_system' => true, 'tags' => ['add', 'create', 'new']],
            ['name' => 'MinusIcon', 'type' => 'heroicons', 'category' => 'actions', 'alphabet_group' => 'M', 'description' => 'Minus icon', 'library_name' => 'MinusIcon', 'is_system' => true, 'tags' => ['subtract', 'remove', 'minimize']],
            ['name' => 'PencilIcon', 'type' => 'heroicons', 'category' => 'actions', 'alphabet_group' => 'P', 'description' => 'Pencil edit', 'library_name' => 'PencilIcon', 'is_system' => true, 'tags' => ['edit', 'pencil', 'modify']],
            ['name' => 'TrashIcon', 'type' => 'heroicons', 'category' => 'actions', 'alphabet_group' => 'T', 'description' => 'Trash icon', 'library_name' => 'TrashIcon', 'is_system' => true, 'tags' => ['delete', 'remove', 'trash']],
            
            // People
            ['name' => 'UserIcon', 'type' => 'heroicons', 'category' => 'people', 'alphabet_group' => 'U', 'description' => 'User icon', 'library_name' => 'UserIcon', 'is_system' => true, 'tags' => ['user', 'person', 'profile']],
            ['name' => 'UserGroupIcon', 'type' => 'heroicons', 'category' => 'people', 'alphabet_group' => 'U', 'description' => 'User group', 'library_name' => 'UserGroupIcon', 'is_system' => true, 'tags' => ['users', 'people', 'group']],
            
            // Communication
            ['name' => 'EnvelopeIcon', 'type' => 'heroicons', 'category' => 'communication', 'alphabet_group' => 'E', 'description' => 'Email icon', 'library_name' => 'EnvelopeIcon', 'is_system' => true, 'tags' => ['email', 'mail', 'message']],
            ['name' => 'PhoneIcon', 'type' => 'heroicons', 'category' => 'communication', 'alphabet_group' => 'P', 'description' => 'Phone icon', 'library_name' => 'PhoneIcon', 'is_system' => true, 'tags' => ['phone', 'call', 'contact']],
            ['name' => 'BellIcon', 'type' => 'heroicons', 'category' => 'communication', 'alphabet_group' => 'B', 'description' => 'Notification bell', 'library_name' => 'BellIcon', 'is_system' => true, 'tags' => ['notification', 'bell', 'alert']],
            
            // Media
            ['name' => 'PhotoIcon', 'type' => 'heroicons', 'category' => 'media', 'alphabet_group' => 'P', 'description' => 'Photo icon', 'library_name' => 'PhotoIcon', 'is_system' => true, 'tags' => ['image', 'photo', 'picture']],
            ['name' => 'CameraIcon', 'type' => 'heroicons', 'category' => 'media', 'alphabet_group' => 'C', 'description' => 'Camera icon', 'library_name' => 'CameraIcon', 'is_system' => true, 'tags' => ['camera', 'photo']],
            ['name' => 'PlayIcon', 'type' => 'heroicons', 'category' => 'media', 'alphabet_group' => 'P', 'description' => 'Play button', 'library_name' => 'PlayIcon', 'is_system' => true, 'tags' => ['play', 'start', 'media']],
            ['name' => 'PauseIcon', 'type' => 'heroicons', 'category' => 'media', 'alphabet_group' => 'P', 'description' => 'Pause button', 'library_name' => 'PauseIcon', 'is_system' => true, 'tags' => ['pause', 'stop', 'media']],
            
            // System
            ['name' => 'Cog6ToothIcon', 'type' => 'heroicons', 'category' => 'system', 'alphabet_group' => 'C', 'description' => 'Settings gear', 'library_name' => 'Cog6ToothIcon', 'is_system' => true, 'tags' => ['settings', 'gear', 'config']],
            ['name' => 'MagnifyingGlassIcon', 'type' => 'heroicons', 'category' => 'system', 'alphabet_group' => 'M', 'description' => 'Search icon', 'library_name' => 'MagnifyingGlassIcon', 'is_system' => true, 'tags' => ['search', 'find', 'magnify']],
            
            // Security
            ['name' => 'LockClosedIcon', 'type' => 'heroicons', 'category' => 'security', 'alphabet_group' => 'L', 'description' => 'Lock closed', 'library_name' => 'LockClosedIcon', 'is_system' => true, 'tags' => ['lock', 'secure', 'private']],
            ['name' => 'LockOpenIcon', 'type' => 'heroicons', 'category' => 'security', 'alphabet_group' => 'L', 'description' => 'Lock open', 'library_name' => 'LockOpenIcon', 'is_system' => true, 'tags' => ['unlock', 'open', 'public']],
            ['name' => 'ShieldCheckIcon', 'type' => 'heroicons', 'category' => 'security', 'alphabet_group' => 'S', 'description' => 'Shield with check', 'library_name' => 'ShieldCheckIcon', 'is_system' => true, 'tags' => ['shield', 'security', 'protect']],
            ['name' => 'EyeIcon', 'type' => 'heroicons', 'category' => 'security', 'alphabet_group' => 'E', 'description' => 'Eye visible', 'library_name' => 'EyeIcon', 'is_system' => true, 'tags' => ['eye', 'view', 'visible']],
            ['name' => 'EyeSlashIcon', 'type' => 'heroicons', 'category' => 'security', 'alphabet_group' => 'E', 'description' => 'Eye hidden', 'library_name' => 'EyeSlashIcon', 'is_system' => true, 'tags' => ['eye', 'hide', 'invisible']],
        ];

        foreach ($icons as $icon) {
            Icon::create($icon);
        }
    }
}
