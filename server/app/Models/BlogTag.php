<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class BlogTag extends Model
{
    protected $table = 'blog_tags';
    
    protected $fillable = ['slug', 'name'];

    // Auto generate unique slug
    public static function boot()
    {
        parent::boot();

        static::creating(function ($tag) {
            $tag->slug = static::makeSlug($tag->name);
        });

        static::updating(function ($tag) {
            if ($tag->isDirty('name')) {
                $tag->slug = static::makeSlug($tag->name);
            }
        });
    }

    public static function makeSlug($name)
    {
        $slug = Str::slug($name);
        $base = $slug;
        $i = 1;

        while (DB::table('blog_tags')->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }

    public function posts() {
        return $this->belongsToMany(BlogPost::class, 'blog_post_tag');
    }
}

