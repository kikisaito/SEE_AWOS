// This is a basic Flutter widget test for AWOS app

import 'package:flutter_test/flutter_test.dart';

import 'package:awos/main.dart';
import 'package:awos/services/mock_api_service.dart';
import 'package:awos/providers/auth_provider.dart';

void main() {
  testWidgets('App initializes with login screen', (WidgetTester tester) async {
    // Build our app and trigger a frame
    final apiService = MockApiService();
    final authProvider = AuthProvider(apiService);
    await tester.pumpWidget(MyApp(
      apiService: apiService,
      authProvider: authProvider,
    ));

    // Wait for any async operations
    await tester.pumpAndSettle();

    // Verify that login screen is displayed
    expect(find.text('Bienvenido a AWOS'), findsOneWidget);
    expect(find.text('Iniciar Sesión'), findsOneWidget);
  });
}
