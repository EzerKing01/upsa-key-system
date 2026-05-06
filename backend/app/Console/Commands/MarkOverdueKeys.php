<?php
namespace App\Console\Commands;
use App\Models\KeyLog;
use Carbon\Carbon;
use Illuminate\Console\Command;
class MarkOverdueKeys extends Command {
    protected $signature = 'keys:mark-overdue';
    protected $description = 'Mark keys as OVERDUE if not returned by 10:00 PM';
    public function handle() {
        $now = Carbon::now();
        if($now->hour >= 22) {
            KeyLog::where('status','OUT')->whereDate('date','<=',$now->toDateString())->update(['status'=>'OVERDUE']);
            $this->info('Overdue keys updated.');
        } else $this->info('Not yet 10 PM.');
    }
}
