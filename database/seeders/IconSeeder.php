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
            ['name' => 'ArrowUp', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'A', 'description' => 'Up arrow', 'library_name' => 'ArrowUp', 'is_system' => true, 'tags' => ['arrow', 'up']],
            ['name' => 'ArrowDown', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'A', 'description' => 'Down arrow', 'library_name' => 'ArrowDown', 'is_system' => true, 'tags' => ['arrow', 'down']],
            ['name' => 'ChevronLeft', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'C', 'description' => 'Chevron left', 'library_name' => 'ChevronLeft', 'is_system' => true, 'tags' => ['chevron', 'left', 'arrow']],
            ['name' => 'ChevronRight', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'C', 'description' => 'Chevron right', 'library_name' => 'ChevronRight', 'is_system' => true, 'tags' => ['chevron', 'right', 'arrow']],
            ['name' => 'ChevronUp', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'C', 'description' => 'Chevron up', 'library_name' => 'ChevronUp', 'is_system' => true, 'tags' => ['chevron', 'up', 'arrow']],
            ['name' => 'ChevronDown', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'C', 'description' => 'Chevron down', 'library_name' => 'ChevronDown', 'is_system' => true, 'tags' => ['chevron', 'down', 'arrow']],
            ['name' => 'ChevronsLeft', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'C', 'description' => 'Double chevron left', 'library_name' => 'ChevronsLeft', 'is_system' => true, 'tags' => ['chevron', 'left', 'double']],
            ['name' => 'ChevronsRight', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'C', 'description' => 'Double chevron right', 'library_name' => 'ChevronsRight', 'is_system' => true, 'tags' => ['chevron', 'right', 'double']],
            ['name' => 'ChevronsUp', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'C', 'description' => 'Double chevron up', 'library_name' => 'ChevronsUp', 'is_system' => true, 'tags' => ['chevron', 'up', 'double']],
            ['name' => 'ChevronsDown', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'C', 'description' => 'Double chevron down', 'library_name' => 'ChevronsDown', 'is_system' => true, 'tags' => ['chevron', 'down', 'double']],
            ['name' => 'ExternalLink', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'E', 'description' => 'External link', 'library_name' => 'ExternalLink', 'is_system' => true, 'tags' => ['link', 'external', 'open']],
            ['name' => 'Link', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'L', 'description' => 'Link icon', 'library_name' => 'Link', 'is_system' => true, 'tags' => ['link', 'chain', 'url']],
            ['name' => 'Navigation', 'type' => 'lucide', 'category' => 'navigation', 'alphabet_group' => 'N', 'description' => 'Navigation compass', 'library_name' => 'Navigation', 'is_system' => true, 'tags' => ['navigation', 'compass', 'direction']],
            
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
            
            // Additional Popular Lucide Icons
            ['name' => 'Star', 'type' => 'lucide', 'category' => 'general', 'alphabet_group' => 'S', 'description' => 'Star icon', 'library_name' => 'Star', 'is_system' => true, 'tags' => ['star', 'favorite', 'rating']],
            ['name' => 'Heart', 'type' => 'lucide', 'category' => 'general', 'alphabet_group' => 'H', 'description' => 'Heart icon', 'library_name' => 'Heart', 'is_system' => true, 'tags' => ['heart', 'like', 'love']],
            ['name' => 'ThumbsUp', 'type' => 'lucide', 'category' => 'general', 'alphabet_group' => 'T', 'description' => 'Thumbs up', 'library_name' => 'ThumbsUp', 'is_system' => true, 'tags' => ['like', 'approve', 'thumbs']],
            ['name' => 'MessageCircle', 'type' => 'lucide', 'category' => 'communication', 'alphabet_group' => 'M', 'description' => 'Message bubble', 'library_name' => 'MessageCircle', 'is_system' => true, 'tags' => ['message', 'chat', 'comment']],
            ['name' => 'Send', 'type' => 'lucide', 'category' => 'communication', 'alphabet_group' => 'S', 'description' => 'Send icon', 'library_name' => 'Send', 'is_system' => true, 'tags' => ['send', 'message', 'submit']],
            ['name' => 'Phone', 'type' => 'lucide', 'category' => 'communication', 'alphabet_group' => 'P', 'description' => 'Phone icon', 'library_name' => 'Phone', 'is_system' => true, 'tags' => ['phone', 'call', 'contact']],
            ['name' => 'Video', 'type' => 'lucide', 'category' => 'media', 'alphabet_group' => 'V', 'description' => 'Video camera', 'library_name' => 'Video', 'is_system' => true, 'tags' => ['video', 'camera', 'record']],
            ['name' => 'Image', 'type' => 'lucide', 'category' => 'media', 'alphabet_group' => 'I', 'description' => 'Image picture', 'library_name' => 'Image', 'is_system' => true, 'tags' => ['image', 'photo', 'picture']],
            ['name' => 'File', 'type' => 'lucide', 'category' => 'files', 'alphabet_group' => 'F', 'description' => 'File document', 'library_name' => 'File', 'is_system' => true, 'tags' => ['file', 'document', 'page']],
            ['name' => 'FileText', 'type' => 'lucide', 'category' => 'files', 'alphabet_group' => 'F', 'description' => 'Text document', 'library_name' => 'FileText', 'is_system' => true, 'tags' => ['file', 'text', 'document']],
            ['name' => 'Folder', 'type' => 'lucide', 'category' => 'files', 'alphabet_group' => 'F', 'description' => 'Folder directory', 'library_name' => 'Folder', 'is_system' => true, 'tags' => ['folder', 'directory', 'files']],
            ['name' => 'Calendar', 'type' => 'lucide', 'category' => 'general', 'alphabet_group' => 'C', 'description' => 'Calendar icon', 'library_name' => 'Calendar', 'is_system' => true, 'tags' => ['calendar', 'date', 'schedule']],
            ['name' => 'Clock', 'type' => 'lucide', 'category' => 'general', 'alphabet_group' => 'C', 'description' => 'Clock time', 'library_name' => 'Clock', 'is_system' => true, 'tags' => ['clock', 'time', 'schedule']],
            ['name' => 'MapPin', 'type' => 'lucide', 'category' => 'general', 'alphabet_group' => 'M', 'description' => 'Location pin', 'library_name' => 'MapPin', 'is_system' => true, 'tags' => ['location', 'pin', 'map']],
            ['name' => 'ShoppingCart', 'type' => 'lucide', 'category' => 'commerce', 'alphabet_group' => 'S', 'description' => 'Shopping cart', 'library_name' => 'ShoppingCart', 'is_system' => true, 'tags' => ['cart', 'shopping', 'ecommerce']],
            ['name' => 'CreditCard', 'type' => 'lucide', 'category' => 'commerce', 'alphabet_group' => 'C', 'description' => 'Credit card', 'library_name' => 'CreditCard', 'is_system' => true, 'tags' => ['card', 'payment', 'credit']],
            ['name' => 'DollarSign', 'type' => 'lucide', 'category' => 'commerce', 'alphabet_group' => 'D', 'description' => 'Dollar sign', 'library_name' => 'DollarSign', 'is_system' => true, 'tags' => ['dollar', 'money', 'price']],
            ['name' => 'Zap', 'type' => 'lucide', 'category' => 'general', 'alphabet_group' => 'Z', 'description' => 'Lightning bolt', 'library_name' => 'Zap', 'is_system' => true, 'tags' => ['lightning', 'fast', 'power']],
            ['name' => 'Award', 'type' => 'lucide', 'category' => 'general', 'alphabet_group' => 'A', 'description' => 'Award medal', 'library_name' => 'Award', 'is_system' => true, 'tags' => ['award', 'medal', 'achievement']],
            ['name' => 'TrendingUp', 'type' => 'lucide', 'category' => 'charts', 'alphabet_group' => 'T', 'description' => 'Trending up', 'library_name' => 'TrendingUp', 'is_system' => true, 'tags' => ['trending', 'up', 'growth']],
            ['name' => 'TrendingDown', 'type' => 'lucide', 'category' => 'charts', 'alphabet_group' => 'T', 'description' => 'Trending down', 'library_name' => 'TrendingDown', 'is_system' => true, 'tags' => ['trending', 'down', 'decline']],
            ['name' => 'BarChart', 'type' => 'lucide', 'category' => 'charts', 'alphabet_group' => 'B', 'description' => 'Bar chart', 'library_name' => 'BarChart', 'is_system' => true, 'tags' => ['chart', 'bar', 'data']],
            ['name' => 'PieChart', 'type' => 'lucide', 'category' => 'charts', 'alphabet_group' => 'P', 'description' => 'Pie chart', 'library_name' => 'PieChart', 'is_system' => true, 'tags' => ['chart', 'pie', 'data']],
            ['name' => 'Globe', 'type' => 'lucide', 'category' => 'general', 'alphabet_group' => 'G', 'description' => 'Globe world', 'library_name' => 'Globe', 'is_system' => true, 'tags' => ['globe', 'world', 'internet']],
            ['name' => 'Wifi', 'type' => 'lucide', 'category' => 'connectivity', 'alphabet_group' => 'W', 'description' => 'WiFi signal', 'library_name' => 'Wifi', 'is_system' => true, 'tags' => ['wifi', 'signal', 'connection']],
            ['name' => 'Smartphone', 'type' => 'lucide', 'category' => 'devices', 'alphabet_group' => 'S', 'description' => 'Smartphone device', 'library_name' => 'Smartphone', 'is_system' => true, 'tags' => ['phone', 'mobile', 'device']],
            ['name' => 'Laptop', 'type' => 'lucide', 'category' => 'devices', 'alphabet_group' => 'L', 'description' => 'Laptop computer', 'library_name' => 'Laptop', 'is_system' => true, 'tags' => ['laptop', 'computer', 'device']],
            ['name' => 'Monitor', 'type' => 'lucide', 'category' => 'devices', 'alphabet_group' => 'M', 'description' => 'Monitor screen', 'library_name' => 'Monitor', 'is_system' => true, 'tags' => ['monitor', 'screen', 'display']],
            
            // Additional Popular Hero Icons
            ['name' => 'AcademicCapIcon', 'type' => 'heroicons', 'category' => 'general', 'alphabet_group' => 'A', 'description' => 'Academic cap', 'library_name' => 'AcademicCapIcon', 'is_system' => true, 'tags' => ['education', 'graduate', 'school']],
            ['name' => 'BookOpenIcon', 'type' => 'heroicons', 'category' => 'general', 'alphabet_group' => 'B', 'description' => 'Open book', 'library_name' => 'BookOpenIcon', 'is_system' => true, 'tags' => ['book', 'read', 'education']],
            ['name' => 'LightBulbIcon', 'type' => 'heroicons', 'category' => 'general', 'alphabet_group' => 'L', 'description' => 'Light bulb', 'library_name' => 'LightBulbIcon', 'is_system' => true, 'tags' => ['idea', 'light', 'innovation']],
            ['name' => 'FireIcon', 'type' => 'heroicons', 'category' => 'general', 'alphabet_group' => 'F', 'description' => 'Fire flame', 'library_name' => 'FireIcon', 'is_system' => true, 'tags' => ['fire', 'hot', 'trending']],
            ['name' => 'SparklesIcon', 'type' => 'heroicons', 'category' => 'general', 'alphabet_group' => 'S', 'description' => 'Sparkles stars', 'library_name' => 'SparklesIcon', 'is_system' => true, 'tags' => ['sparkles', 'magic', 'special']],
            ['name' => 'BoltIcon', 'type' => 'heroicons', 'category' => 'general', 'alphabet_group' => 'B', 'description' => 'Lightning bolt', 'library_name' => 'BoltIcon', 'is_system' => true, 'tags' => ['lightning', 'fast', 'power']],
            ['name' => 'GiftIcon', 'type' => 'heroicons', 'category' => 'general', 'alphabet_group' => 'G', 'description' => 'Gift box', 'library_name' => 'GiftIcon', 'is_system' => true, 'tags' => ['gift', 'present', 'reward']],
            ['name' => 'TrophyIcon', 'type' => 'heroicons', 'category' => 'general', 'alphabet_group' => 'T', 'description' => 'Trophy award', 'library_name' => 'TrophyIcon', 'is_system' => true, 'tags' => ['trophy', 'award', 'win']],
            ['name' => 'RocketLaunchIcon', 'type' => 'heroicons', 'category' => 'general', 'alphabet_group' => 'R', 'description' => 'Rocket launch', 'library_name' => 'RocketLaunchIcon', 'is_system' => true, 'tags' => ['rocket', 'launch', 'startup']],
            ['name' => 'BanknotesIcon', 'type' => 'heroicons', 'category' => 'commerce', 'alphabet_group' => 'B', 'description' => 'Banknotes money', 'library_name' => 'BanknotesIcon', 'is_system' => true, 'tags' => ['money', 'cash', 'payment']],
            ['name' => 'ChartBarIcon', 'type' => 'heroicons', 'category' => 'charts', 'alphabet_group' => 'C', 'description' => 'Bar chart', 'library_name' => 'ChartBarIcon', 'is_system' => true, 'tags' => ['chart', 'bar', 'analytics']],
            ['name' => 'ChartPieIcon', 'type' => 'heroicons', 'category' => 'charts', 'alphabet_group' => 'C', 'description' => 'Pie chart', 'library_name' => 'ChartPieIcon', 'is_system' => true, 'tags' => ['chart', 'pie', 'analytics']],
            ['name' => 'GlobeAltIcon', 'type' => 'heroicons', 'category' => 'general', 'alphabet_group' => 'G', 'description' => 'Globe world', 'library_name' => 'GlobeAltIcon', 'is_system' => true, 'tags' => ['globe', 'world', 'international']],
            ['name' => 'SignalIcon', 'type' => 'heroicons', 'category' => 'connectivity', 'alphabet_group' => 'S', 'description' => 'Signal bars', 'library_name' => 'SignalIcon', 'is_system' => true, 'tags' => ['signal', 'connection', 'strength']],
            ['name' => 'WifiIcon', 'type' => 'heroicons', 'category' => 'connectivity', 'alphabet_group' => 'W', 'description' => 'WiFi signal', 'library_name' => 'WifiIcon', 'is_system' => true, 'tags' => ['wifi', 'wireless', 'internet']],
            ['name' => 'ComputerDesktopIcon', 'type' => 'heroicons', 'category' => 'devices', 'alphabet_group' => 'C', 'description' => 'Desktop computer', 'library_name' => 'ComputerDesktopIcon', 'is_system' => true, 'tags' => ['computer', 'desktop', 'monitor']],
            ['name' => 'DevicePhoneMobileIcon', 'type' => 'heroicons', 'category' => 'devices', 'alphabet_group' => 'D', 'description' => 'Mobile phone', 'library_name' => 'DevicePhoneMobileIcon', 'is_system' => true, 'tags' => ['phone', 'mobile', 'smartphone']],
            ['name' => 'DeviceTabletIcon', 'type' => 'heroicons', 'category' => 'devices', 'alphabet_group' => 'D', 'description' => 'Tablet device', 'library_name' => 'DeviceTabletIcon', 'is_system' => true, 'tags' => ['tablet', 'ipad', 'device']],
            
            // ============================================
            // SVG CUSTOM SAMPLES
            // ============================================
            
            [
                'name' => 'Custom Logo', 
                'type' => 'svg', 
                'category' => 'custom', 
                'alphabet_group' => 'C', 
                'description' => 'Custom sample logo', 
                'library_name' => null,
                'is_system' => true, 
                'tags' => ['logo', 'custom', 'brand'],
                'svg_code' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>'
            ],
            [
                'name' => 'Custom Rocket', 
                'type' => 'svg', 
                'category' => 'custom', 
                'alphabet_group' => 'C', 
                'description' => 'Custom rocket icon', 
                'library_name' => null,
                'is_system' => true, 
                'tags' => ['rocket', 'launch', 'space'],
                'svg_code' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>'
            ],
        ];

        foreach ($icons as $icon) {
            Icon::create($icon);
        }
    }
}
