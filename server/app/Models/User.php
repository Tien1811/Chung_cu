<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'users';
    
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'role',
        // 2 field này nếu còn trong DB thì giữ lại, nhưng không dùng cho Cloudinary
        'avatar_url',
        'avatar_public_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // luôn append avatar_url khi toArray/toJson
    protected $appends = ['avatar_url'];

    // ==== QUAN HỆ CLOUDINARY ====
    public function cloudinaryFiles()
    {
        return $this->morphMany(CloudinaryFile::class, 'model');
    }

    public function avatarFile()
    {
        return $this->morphOne(CloudinaryFile::class, 'model')
            ->where('type', 'avatar');
    }

    // ==== TÍNH avatar_url ====
    public function getAvatarUrlAttribute()
    {
        // Ưu tiên Cloudinary
        if ($this->avatarFile) {
            return $this->avatarFile->url;
        }

        // fallback: nếu vẫn còn dùng cột avatar_url cũ
        if (!empty($this->attributes['avatar_url'])) {
            return $this->attributes['avatar_url'];
        }

        // fallback: nếu còn cột avatar lưu trong storage
        if (!empty($this->attributes['avatar'])) {
            return asset('storage/' . $this->attributes['avatar']);
        }

        return null;
    }

    // ==== CÁC QUAN HỆ KHÁC GIỮ NGUYÊN ====
    public function posts()      { return $this->hasMany(Post::class); }
    public function reviews()    { return $this->hasMany(Review::class); }
    public function savedPosts() { return $this->belongsToMany(Post::class, 'saved_posts')->withTimestamps(); }
    public function rentalContracts() { return $this->hasMany(RentalContract::class); }
    public function sentMessages()    { return $this->hasMany(Message::class, 'sender_id'); }
    public function receivedMessages(){ return $this->hasMany(Message::class, 'receiver_id'); }
    public function appointmentsAsRenter() { return $this->hasMany(Appointment::class, 'renter_id'); }
    public function appointmentsAsOwner()  { return $this->hasMany(Appointment::class, 'owner_id'); }
    public function notifications()        { return $this->hasMany(Notification::class); }

    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }
}
