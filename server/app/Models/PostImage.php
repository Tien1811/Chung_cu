<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostImage extends Model
{
    protected $table = 'post_images';
    
    protected $fillable = ['post_id', 'sort_order'];

    public function post() {
        return $this->belongsTo(Post::class);
    }

    public function file()
    {
        return $this->morphOne(CloudinaryFile::class, 'model')->where('type', 'post_image');
    }
}
