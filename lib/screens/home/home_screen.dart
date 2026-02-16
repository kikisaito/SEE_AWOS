import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_provider.dart';
import '../capsules/capsules_screen.dart';
import '../victories/victories_screen.dart';
import '../crisis/crisis_emotion_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    // Build screens list in build method to access setState
    final screens = [
      _DashboardView(
        onNavigateToVictories: () {
          setState(() {
            _selectedIndex = 2; // Navigate to Victories tab
          });
        },
      ),
      const CapsulesScreen(),
      const VictoriesScreen(),
    ];

    return Scaffold(
      body: screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.lightbulb_outline),
            label: 'Cápsulas',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.emoji_events),
            label: 'Victorias',
          ),
        ],
      ),
    );
  }
}

class _DashboardView extends StatefulWidget {
  final VoidCallback onNavigateToVictories;

  const _DashboardView({required this.onNavigateToVictories});

  @override
  State<_DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<_DashboardView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DataProvider>().loadDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final dataProvider = context.watch<DataProvider>();
    final user = authProvider.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('AWOS'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await authProvider.logout();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (user != null) ...[
              Text(
                '¡Hola, ${user.nombrePreferido}!',
                style: Theme.of(context).textTheme.displayMedium,
              ),
              const SizedBox(height: 8),
              Text(
                '¿Cómo te sientes hoy?',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 32),
            ],
            Row(
              children: [
                Expanded(
                  child: _FeelingButton(
                    emoji: '😊',
                    label: 'BIEN',
                    color: const Color(0xFF86EFAC),
                    onTap: widget.onNavigateToVictories,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _FeelingButton(
                    emoji: '🆘',
                    label: 'EN CRISIS',
                    color: const Color(0xFFFB7185),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const CrisisEmotionScreen(),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 40),

            // Error handling with retry button
            if (dataProvider.errorMessage != null) ...[
              Card(
                color: Colors.red.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      const Icon(Icons.error_outline,
                          color: Colors.red, size: 48),
                      const SizedBox(height: 8),
                      Text(
                        'Error al cargar dashboard',
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: Colors.red.shade900,
                                ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        dataProvider.errorMessage!,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () {
                          context.read<DataProvider>().loadDashboard();
                        },
                        icon: const Icon(Icons.refresh),
                        label: const Text('Reintentar'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
            ],

            // Dashboard summary cards
            if (dataProvider.dashboardData != null &&
                dataProvider.errorMessage == null) ...[
              Text(
                'Resumen',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 16),
              _SummaryCard(
                icon: Icons.emoji_events,
                title: 'Victorias esta semana',
                value: '${dataProvider.dashboardData!.weeklyVictoriesCount}',
                color: const Color(0xFF5EEAD4),
              ),
              const SizedBox(height: 12),
              if (dataProvider.dashboardData!.lastCrisis != null)
                _SummaryCard(
                  icon: Icons.favorite,
                  title: 'Última crisis',
                  value: dataProvider.dashboardData!.lastCrisis!.emotion,
                  subtitle: dataProvider.dashboardData!.lastCrisis!.evaluation,
                  color: const Color(0xFF86EFAC),
                ),
            ] else if (dataProvider.isLoading) ...[
              const Center(child: CircularProgressIndicator()),
            ] else if (dataProvider.errorMessage != null) ...[
              Card(
                color: Colors.red[50],
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    'Error: ${dataProvider.errorMessage}',
                    style: TextStyle(color: Colors.red[900]),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _FeelingButton extends StatelessWidget {
  final String emoji;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _FeelingButton({
    required this.emoji,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 32),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color, width: 2),
        ),
        child: Column(
          children: [
            Text(
              emoji,
              style: const TextStyle(fontSize: 48),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color.withValues(alpha: 0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final String? subtitle;
  final Color color;

  const _SummaryCard({
    required this.icon,
    required this.title,
    required this.value,
    this.subtitle,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      subtitle!,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
