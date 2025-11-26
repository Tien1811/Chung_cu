<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LessorApplication extends Model
{
    protected $fillable = [
        'user_id', 'note', 'status', 'admin_note'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function files()
    {
        return $this->morphMany(CloudinaryFile::class, 'model');
    }

    public function pdfFile()
    {
        return $this->morphOne(CloudinaryFile::class, 'model')->where('type', 'lessor_pdf');
    }
}
