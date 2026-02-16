import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'services/mock_api_service.dart';
import 'providers/auth_provider.dart';
import 'providers/data_provider.dart';
import 'providers/crisis_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';

void main() {
  final apiService = MockApiService();
  runApp(MyApp(apiService: apiService));
}

class MyApp extends StatelessWidget {
  final MockApiService apiService;

  const MyApp({super.key, required this.apiService});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(apiService),
        ),
        ChangeNotifierProvider(
          create: (context) {
            final provider = DataProvider(apiService);
            provider.loadCatalogs();
            return provider;
          },
        ),
        ChangeNotifierProvider(
          create: (_) => CrisisProvider(apiService),
        ),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          return MaterialApp(
            title: 'AWOS',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            home: authProvider.isAuthenticated
                ? const HomeScreen()
                : const LoginScreen(),
          );
        },
      ),
    );
  }
}
