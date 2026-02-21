import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class LocalDatabaseService {
  static Database? _database;

  static Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  static Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'awos.db');

    return await openDatabase(
      path,
      version: 2,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE crisis (
            id TEXT PRIMARY KEY,
            started_at TEXT NOT NULL,
            emotion TEXT NOT NULL,
            evaluation TEXT,
            breathing_completed INTEGER NOT NULL DEFAULT 0,
            is_synced INTEGER NOT NULL DEFAULT 0,
            reflection_pending INTEGER NOT NULL DEFAULT 1,
            reflection_trigger TEXT,
            reflection_location TEXT,
            reflection_company TEXT,
            reflection_substance TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )
        ''');
        await db.execute('''
          CREATE TABLE capsules (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL DEFAULT '',
            emotion_id INTEGER NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            type TEXT NOT NULL DEFAULT 'texto',
            audio_path TEXT,
            is_synced INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )
        ''');
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          await db.execute('''
            CREATE TABLE IF NOT EXISTS capsules (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              content TEXT NOT NULL DEFAULT '',
              emotion_id INTEGER NOT NULL,
              is_active INTEGER NOT NULL DEFAULT 1,
              type TEXT NOT NULL DEFAULT 'texto',
              audio_path TEXT,
              is_synced INTEGER NOT NULL DEFAULT 0,
              created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
          ''');
        }
      },
    );
  }

  // --- Crisis methods ---

  static Future<int> insertCrisis(Map<String, dynamic> crisis) async {
    final db = await database;
    return await db.insert(
      'crisis',
      crisis,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  static Future<int> updateCrisisReflection(
    String crisisId, {
    required String trigger,
    required String location,
    required String company,
    required String substance,
  }) async {
    final db = await database;
    return await db.update(
      'crisis',
      {
        'reflection_trigger': trigger,
        'reflection_location': location,
        'reflection_company': company,
        'reflection_substance': substance,
        'reflection_pending': 0,
      },
      where: 'id = ?',
      whereArgs: [crisisId],
    );
  }

  static Future<List<Map<String, dynamic>>> getUnsyncedCrises() async {
    final db = await database;
    return await db.query(
      'crisis',
      where: 'is_synced = ?',
      whereArgs: [0],
    );
  }

  static Future<int> markAsSynced(String crisisId) async {
    final db = await database;
    return await db.update(
      'crisis',
      {'is_synced': 1},
      where: 'id = ?',
      whereArgs: [crisisId],
    );
  }

  static Future<List<Map<String, dynamic>>> getAllCrises() async {
    final db = await database;
    return await db.query('crisis', orderBy: 'started_at DESC');
  }

  // --- Capsules methods ---

  static Future<int> insertCapsule(Map<String, dynamic> capsule) async {
    final db = await database;
    return await db.insert(
      'capsules',
      capsule,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  static Future<List<Map<String, dynamic>>> getAllCapsules() async {
    final db = await database;
    return await db.query('capsules', orderBy: 'created_at DESC');
  }

  static Future<int> updateCapsuleSync(String capsuleId) async {
    final db = await database;
    return await db.update(
      'capsules',
      {'is_synced': 1},
      where: 'id = ?',
      whereArgs: [capsuleId],
    );
  }

  static Future<List<Map<String, dynamic>>> getUnsyncedCapsules() async {
    final db = await database;
    return await db.query(
      'capsules',
      where: 'is_synced = ?',
      whereArgs: [0],
    );
  }
}
