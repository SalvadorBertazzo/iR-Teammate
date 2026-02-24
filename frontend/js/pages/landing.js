// Landing page
import { getCatalogs } from '../state.js';
import { isLoggedIn } from '../state.js';
import { login } from '../api/auth.js';

export function render(container) {
    const catalogs = getCatalogs();
    const loggedIn  = isLoggedIn();

    const stats = [
        { value: catalogs.series.length,     label: 'Series' },
        { value: catalogs.tracks.length,     label: 'Tracks' },
        { value: catalogs.cars.length,       label: 'Cars' },
        { value: catalogs.carClasses.length, label: 'Car Classes' },
    ];

    container.innerHTML = `
        <div class="landing">

            <!-- ── Hero ── -->
            <section class="landing-hero">
                <div class="landing-hero-inner">

                    <div class="landing-wordmark">
                        <span class="landing-wordmark-ir">iR</span><span class="landing-wordmark-tm">Teammate</span>
                    </div>

                    <h1 class="landing-headline">
                        Find your iRacing<br>team, race together
                    </h1>

                    <p class="landing-sub">
                        The platform where iRacing drivers post team searches,
                        filter by series, car and license level, and connect to compete together.
                    </p>

                    <div class="landing-ctas">
                        <a href="#/browse" class="btn-primary landing-btn-lg">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            Browse Posts
                        </a>
                        ${loggedIn
                            ? `<a href="#/posts/create" class="btn-secondary landing-btn-lg">
                                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                   </svg>
                                   Create Post
                               </a>`
                            : `<button id="landing-login-btn" class="btn-secondary landing-btn-lg">
                                   <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                       <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                                   </svg>
                                   Login with Discord
                               </button>`
                        }
                    </div>
                </div>
            </section>

            <!-- ── Stats ── -->
            <section class="landing-stats-bar">
                <div class="landing-stats-inner">
                    ${stats.map(s => `
                        <div class="landing-stat">
                            <span class="landing-stat-value">${s.value}</span>
                            <span class="landing-stat-label">${s.label}</span>
                        </div>
                    `).join('<div class="landing-stat-divider"></div>')}
                </div>
            </section>

            <!-- ── How it works ── -->
            <section class="landing-how">
                <div class="landing-how-inner">
                    <h2 class="landing-section-title">How it works</h2>

                    <div class="landing-steps">

                        <div class="landing-step">
                            <div class="landing-step-icon">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                            </div>
                            <div class="landing-step-num">01</div>
                            <h3 class="landing-step-title">Post your search</h3>
                            <p class="landing-step-desc">
                                Create a post with your series, car, license level and how many slots you need. Your search is visible to the whole community in minutes.
                            </p>
                        </div>

                        <div class="landing-step-arrow">
                            <svg class="w-5 h-5 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </div>

                        <div class="landing-step">
                            <div class="landing-step-icon">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                            <div class="landing-step-num">02</div>
                            <h3 class="landing-step-title">Browse posts</h3>
                            <p class="landing-step-desc">
                                Filter by series, car class, iRating or license level. Find teams that fit your exact driver profile.
                            </p>
                        </div>

                        <div class="landing-step-arrow">
                            <svg class="w-5 h-5 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </div>

                        <div class="landing-step">
                            <div class="landing-step-icon">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                            </div>
                            <div class="landing-step-num">03</div>
                            <h3 class="landing-step-title">Apply and race</h3>
                            <p class="landing-step-desc">
                                Send your application with a message. The post owner reviews candidates, picks the best fit, and you hit the track together.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    `;

    const loginBtn = document.getElementById('landing-login-btn');
    if (loginBtn) loginBtn.addEventListener('click', login);
}
