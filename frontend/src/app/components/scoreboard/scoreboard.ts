import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService, Team } from '../../services/team';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.html',
  styleUrls: ['./scoreboard.scss']
})
export class ScoreboardComponent implements OnInit {
  teams: Team[] = [];
  isLoading = true;

  constructor(private teamService: TeamService) { }

  ngOnInit(): void {
    this.loadTeamScoreboard();
  }

  loadTeamScoreboard(): void {
    this.isLoading = true;
    this.teamService.getTeamScoreboard().subscribe({
      next: (response) => {
        this.teams = response.teams || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.teams = [];
        this.isLoading = false;
      }
    });
  }
}
